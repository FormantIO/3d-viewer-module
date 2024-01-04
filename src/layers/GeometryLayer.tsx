import {
  defined,
  definedAndNotNull,
  IMarker3DArray,
  UniverseTelemetrySource,
} from "@formant/universe-core";
import {
  MutableRefObject,
  startTransition,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Box3,
  BufferGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  Line,
  LineBasicMaterial,
  Matrix4,
  Mesh,
  MeshLambertMaterial,
  MeshPhongMaterial,
  Object3D,
  Points,
  PointsMaterial,
  Sprite,
  SpriteMaterial,
  Texture,
  Vector3,
} from "three";
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import { LayerContext } from "./common/LayerContext";
import { GeometryWorld } from "./objects/GeometryWorld";
import { UniverseDataContext } from "./common/UniverseDataContext";
import { DataVisualizationLayer } from "./DataVisualizationLayer";
import { IUniverseLayerProps } from "./types";
import { Box, Cone, Html, Sphere } from "@react-three/drei";

interface IGeometryLayer extends IUniverseLayerProps {
  dataSource: UniverseTelemetrySource;
  allowTransparency: boolean;
}

type GeoInstanceData = {
  id: string;
  type: string;
  position: { x: number; y: number; z: number };
  rotation: { w: number; x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  color: { r: number; g: number; b: number; a: number };
  dirty: boolean;
};

type InstancedGeoProps = {
  instances: GeoInstanceData[];
  allowTransparency?: boolean;
};

function InstancedGeometry({
  instances,
  allowTransparency,
}: InstancedGeoProps) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const boundingBox = useRef<Box3>(new Box3());
  const type = instances[0].type;

  const matrixCache = useRef<Map<string, Matrix4>>(new Map());
  const dummy = useMemo(() => new Object3D(), []);

  useLayoutEffect(() => {
    if (ref.current) {
      boundingBox.current.setFromCenterAndSize(
        new Vector3(
          instances[0].position.x,
          instances[0].position.y,
          instances[0].position.z
        ),
        new Vector3(0.1, 0.1, 0.1)
      );

      instances.forEach((data, index) => {
        const { position, rotation, scale, color } = data;

        const transformKey = `${position.x},${position.y},${position.z}|${rotation.x},${rotation.y},${rotation.z},${rotation.w}|${scale.x},${scale.y},${scale.z}`;
        let instanceMatrix = matrixCache.current.get(transformKey);

        if (!instanceMatrix) {
          dummy.position.set(position.x, position.y, position.z);
          dummy.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
          dummy.scale.set(scale.x, scale.z, scale.y);
          dummy.updateMatrix();

          instanceMatrix = dummy.matrix.clone();
          matrixCache.current.set(transformKey, instanceMatrix);
        }
        boundingBox.current.expandByPoint(dummy.position);

        if (ref.current) {
          ref.current.up = new Vector3(0, 0, 1);
          ref.current.setMatrixAt(index, dummy.matrix);
          ref.current.setColorAt(index, new Color(color.r, color.g, color.b));
          if (ref.current.instanceColor) {
            ref.current.instanceColor.needsUpdate = true;
          }
        }
      });
    }
  }, [ref, instances]);

  if (allowTransparency) {
    // if we need transparency we can't used instanced mesh and should fallback
    return (
      <group>
        {instances && type === "sphere"
          ? instances.map((data) => {
            return (
              <Sphere
                key={data.id}
                args={[0.5, 32, 16]}
                scale={[data.scale.x, data.scale.z, data.scale.y]}
                position={[data.position.x, data.position.y, data.position.z]}
                rotation={[data.rotation.x, data.rotation.y, data.rotation.z]}
              >
                <meshLambertMaterial
                  attach="material"
                  color={[data.color.r, data.color.g, data.color.b]}
                  opacity={data.color.a}
                  transparent={data.color.a < 1}
                />
              </Sphere>
            );
          })
          : null}
        {instances && type === "cube"
          ? instances.map((data) => {
            return (
              <Box
                key={data.id}
                args={[0.9, 0.9, 0.9]}
                scale={[data.scale.x, data.scale.z, data.scale.y]}
                position={[data.position.x, data.position.y, data.position.z]}
                rotation={[data.rotation.x, data.rotation.y, data.rotation.z]}
              >
                <meshLambertMaterial
                  attach="material"
                  color={[data.color.r, data.color.g, data.color.b]}
                  opacity={data.color.a}
                  transparent={data.color.a < 1}
                />
              </Box>
            );
          })
          : null}
      </group>
    );
  } else {
    return (
      <>
        <instancedMesh
          ref={ref}
          args={[null as any, null as any, instances.length]}
        >
          {type === "sphere" ? (
            <sphereBufferGeometry
              attach="geometry"
              args={[0.5, 32, 16]}
            ></sphereBufferGeometry>
          ) : null}
          {type === "cube" ? (
            <boxGeometry attach="geometry" args={[0.9, 0.9, 0.9]}></boxGeometry>
          ) : null}
          <meshLambertMaterial attach="material" />
        </instancedMesh>
        <box3Helper args={[boundingBox.current]} visible={false} />
      </>
    );
  }
}

export function GeometryLayer(props: IGeometryLayer) {
  const { children, dataSource, allowTransparency } = props;

  const world = useRef(new GeometryWorld());

  const worldGeometry: MutableRefObject<Map<string, Mesh | Line | Sprite | Points>> =
    useRef(new Map());

  const rootRef = useRef(new Object3D());
  const [universeData, liveUniverseData] = useContext(UniverseDataContext);
  const layerData = useContext(LayerContext);
  const [cubesData, setCubesData] = useState<GeoInstanceData[]>([]);
  const [spheresData, setSpheresData] = useState<GeoInstanceData[]>([]);
  const [geoKey, setGeoKey] = useState(0);

  useEffect(() => {
    const unsubscribe = universeData.subscribeToGeometry(
      definedAndNotNull(layerData, "geometry layer requires device context")
        .deviceId,
      dataSource,
      (d) => {
        if (typeof d === "symbol") {
          //console.warn("geometry received error from universe data");
          return;
        }
        const markerArray = d as IMarker3DArray;
        world.current.processMarkers(markerArray);
        const geometry = world.current.getAllGeometry();
        const cubes = geometry.filter(
          (g) => g.type === "cube"
        ) as GeoInstanceData[];
        const spheres = geometry.filter(
          (g) => g.type === "sphere"
        ) as GeoInstanceData[];
        console.log("geometry", geometry)
        const root = rootRef.current;
        geometry.forEach((g) => {
          if (g.dirty) {
            const mesh = worldGeometry.current.get(g.id);
            if (g.type === "line_list") {
              if (!mesh) {
                const material = new LineBasicMaterial({
                  color: new Color(g.color.r, g.color.g, g.color.b),
                  opacity: g.color.a,
                  linewidth: 1 // with webGL this is always 1, webGPU will fix this someday
                });

                const meshGeometry = new BufferGeometry().setFromPoints(
                  g.points as Vector3[]
                );
                const lines = new Line(meshGeometry, material);
                lines.position.set(g.position.x, g.position.y, g.position.z);
                lines.rotation.set(g.rotation.x, g.rotation.y, g.rotation.z);

                root.add(lines);
                worldGeometry.current.set(g.id, lines);
              } else {
                mesh.geometry.setFromPoints(g.points as Vector3[]);
                mesh.position.set(g.position.x, g.position.y, g.position.z);
                mesh.rotation.set(g.rotation.x, g.rotation.y, g.rotation.z);
                mesh.material = new LineBasicMaterial({
                  color: new Color(g.color.r, g.color.g, g.color.b),
                  opacity: g.color.a,
                });
              }
            } else if (g.type === "text") {
              const fontface = "Arial";
              const fontsize = 30;
              const message = g.text;
              const font = `${fontsize}px ${fontface}`;

              const canvas = document.createElement("canvas");
              const context = definedAndNotNull(canvas.getContext("2d"));

              // get size data (height depends only on font size)
              context.font = font;
              const metrics = context.measureText(message);
              const textWidth = metrics.width;
              const textHeight = fontsize;
              canvas.width = textWidth;
              canvas.height = textHeight;
              context.fillStyle = "#2d3855";
              context.fillRect(0, 0, textWidth, textHeight);

              // background color
              context.font = font;
              context.fillStyle = "#bac4e2";
              context.fillText(message, 0, fontsize);

              // canvas contents will be used for a texture
              const texture = new Texture(canvas);
              texture.needsUpdate = true;

              const spriteMaterial = new SpriteMaterial({
                map: texture,
              });

              if (!mesh) {
                const sprite = new Sprite(spriteMaterial);
                const pixelScale = 1;

                // scale sprite so it isn't stretched
                sprite.scale.set(
                  1 / pixelScale,
                  textHeight / textWidth / pixelScale,
                  1.0 / pixelScale
                );
                sprite.position.set(
                  g.position.x,
                  g.position.y,
                  g.position.z
                );
                root.add(sprite);
                worldGeometry.current.set(g.id, sprite);
              } else {
                mesh.material = spriteMaterial;
              }
            } else if (g.type === "arrow") {
              if (!mesh) {
                const material = new MeshLambertMaterial({
                  color: new Color(g.color.r, g.color.g, g.color.b),
                  opacity: g.color.a,
                });

                const shaftDiameter = g.points.length < 2 ? 0.01 : g.scale.x;
                const headDiameter = g.points.length < 2 ? 0.05 : g.scale.y;
                const headLength = (g.points.length < 2 && g.scale.z) ? 0.1 : g.scale.z;
                const arrowShaft = new CylinderGeometry(
                  shaftDiameter,
                  shaftDiameter,
                  0.5,
                  8,
                  1,
                  false
                );
                const arrowHead = new ConeGeometry(headDiameter, headLength, 8, 1, false);
                arrowHead.translate(0, 0.25, 0);
                const arrowGeometry = BufferGeometryUtils.mergeBufferGeometries(
                  [arrowShaft, arrowHead]
                );
                const arrowMesh = new Mesh(arrowGeometry, material);


                if (g.points.length < 2) {
                  arrowMesh.position.set(g.position.x, g.position.y, g.position.z);
                  arrowMesh.scale.set(g.scale.x, g.scale.z, g.scale.y);
                  arrowMesh.rotation.set(g.rotation.x, g.rotation.y, g.rotation.z);
                } else {
                  const start = new Vector3(g.points[0].x, g.points[0].y, g.points[0].z);
                  const end = new Vector3(g.points[1].x, g.points[1].y, g.points[1].z);
                  const dir = new Vector3().subVectors(end, start);
                  const length = dir.length();
                  const arrowDir = dir.normalize();
                  arrowMesh.position.set(start.x, start.y, start.z);
                  arrowMesh.scale.set(1, length, 1);
                  arrowMesh.quaternion.setFromUnitVectors(
                    new Vector3(0, 1, 0),
                    arrowDir
                  );
                }


                root.add(arrowMesh);
                worldGeometry.current.set(g.id, arrowMesh);
              } else {
                if (g.points.length < 2) {
                  mesh.position.set(g.position.x, g.position.y, g.position.z);
                  mesh.scale.set(g.scale.x, g.scale.z, g.scale.y);
                  mesh.rotation.set(g.rotation.x, g.rotation.y, g.rotation.z);
                } else {
                  const start = new Vector3(g.points[0].x, g.points[0].y, g.points[0].z);
                  const end = new Vector3(g.points[1].x, g.points[1].y, g.points[1].z);
                  const dir = new Vector3().subVectors(end, start);
                  const length = dir.length();
                  const arrowDir = dir.normalize();
                  mesh.position.set(start.x, start.y, start.z);
                  mesh.scale.set(1, length, 1);
                  mesh.quaternion.setFromUnitVectors(
                    new Vector3(0, 1, 0),
                    arrowDir
                  );
                }
              }
            } else if (g.type === "cylinder") {
              if (!mesh) {
                const material = new MeshLambertMaterial({
                  color: new Color(g.color.r, g.color.g, g.color.b),
                  opacity: g.color.a,
                });

                const cylinderGeometry = new CylinderGeometry(
                  0.1,
                  0.1,
                  g.scale.z,
                  8,
                  1,
                  false
                );
                const cylinderMesh = new Mesh(cylinderGeometry, material);

                cylinderMesh.position.set(g.position.x, g.position.y, g.position.z);
                cylinderMesh.scale.set(g.scale.x, 1, g.scale.y);
                cylinderMesh.rotation.set(g.rotation.x, g.rotation.y, g.rotation.z);

                root.add(cylinderMesh);
                worldGeometry.current.set(g.id, cylinderMesh);
              } else {
                mesh.position.set(g.position.x, g.position.y, g.position.z);
                mesh.scale.set(g.scale.x, g.scale.z, g.scale.y);
                mesh.rotation.set(g.rotation.x, g.rotation.y, g.rotation.z);
              }
            } else if (g.type === "points") {
              const serializedPoints = g.points.map((p) => {
                return new Vector3(p.x, p.y, p.z);
              }
              );
              if (!mesh) {
                // TODO: make this support individual point colors using vertex colors
                const material = new PointsMaterial({
                  color: new Color(g.color.r, g.color.g, g.color.b),
                  opacity: g.color.a,
                  size: g.scale.x,
                });

                const pointsGeometry = new BufferGeometry().setFromPoints(
                  serializedPoints as Vector3[]
                );
                const pointsMesh = new Points(pointsGeometry, material);

                pointsMesh.position.set(g.position.x, g.position.y, g.position.z);
                pointsMesh.rotation.set(g.rotation.x, g.rotation.y, g.rotation.z);

                root.add(pointsMesh);
                worldGeometry.current.set(g.id, pointsMesh);
              } else {
                mesh.geometry.setFromPoints(serializedPoints as Vector3[]);
                mesh.position.set(g.position.x, g.position.y, g.position.z);
                mesh.rotation.set(g.rotation.x, g.rotation.y, g.rotation.z);
              }
            }
            g.dirty = false;
          }
        });

        const oldGeoIds = [...worldGeometry.current.keys()];
        const newGeoIds = new Set(geometry.map((g) => g.id));
        const toRemove = oldGeoIds.filter((id) => !newGeoIds.has(id));
        console.log(root);
        toRemove.forEach((id) => {
          root.remove(defined(worldGeometry.current.get(id)));
          worldGeometry.current.delete(id);
        });
        startTransition(() => {
          setCubesData(cubes);
          setSpheresData(spheres);
          setGeoKey((k) => k + 1);
        });
      }
    );
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <DataVisualizationLayer {...props} iconUrl="icons/3d_object.svg">
      <group>
        <primitive object={rootRef.current} />
        {cubesData.length > 0 ? (
          <InstancedGeometry
            instances={cubesData}
            allowTransparency={allowTransparency}
          />
        ) : null}
        {spheresData.length > 0 ? (
          <InstancedGeometry
            instances={spheresData}
            allowTransparency={allowTransparency}
          />
        ) : null}
      </group>
      {children}
    </DataVisualizationLayer>
  );
}
