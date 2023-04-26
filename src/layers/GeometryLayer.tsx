import {
  defined,
  definedAndNotNull,
  IMarker3DArray,
  UniverseTelemetrySource,
} from "@formant/universe-core";
import {
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
  Line,
  LineBasicMaterial,
  Matrix4,
  Mesh,
  Object3D,
  Sprite,
  SpriteMaterial,
  Texture,
  Vector3,
} from "three";
import { LayerContext } from "./common/LayerContext";
import { GeometryWorld } from "./objects/GeometryWorld";
import { UniverseDataContext } from "./common/UniverseDataContext";
import { DataVisualizationLayer } from "./DataVisualizationLayer";
import { IUniverseLayerProps } from "./types";

interface IGeometryLayer extends IUniverseLayerProps {
  dataSource: UniverseTelemetrySource;
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
};

function InstancedGeometry({ instances }: InstancedGeoProps) {
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
          dummy.scale.set(scale.x, scale.y, scale.z);
          dummy.updateMatrix();

          instanceMatrix = dummy.matrix.clone();
          matrixCache.current.set(transformKey, instanceMatrix);
        }
        boundingBox.current.expandByPoint(dummy.position);

        if (ref.current) {
          ref.current.up = new Vector3(0, 0, 1);
          ref.current.setMatrixAt(index, dummy.matrix);
          ref.current.setColorAt(index, new Color(color.r, color.g, color.b));
        }
      });
    }
  }, []);

  return (
    <>
      <instancedMesh
        ref={ref}
        args={[null as any, null as any, instances.length]}
      >
        {type === "sphere" && (
          <sphereBufferGeometry
            attach="geometry"
            args={[0.5, 32, 16]}
          ></sphereBufferGeometry>
        )}
        {type === "cube" && (
          <boxGeometry
            attach="geometry"
            args={[0.9, 0.9, 0.9]}
          ></boxGeometry>
        )}
        <meshBasicMaterial attach="material" />
      </instancedMesh>
      <box3Helper args={[boundingBox.current]} visible={false} />
    </>
  );
}

export function GeometryLayer(props: IGeometryLayer) {
  const { children, dataSource } = props;
  const world = new GeometryWorld();

  const worldGeometry: Map<string, Mesh | Line | Sprite> = new Map();

  const root = new Object3D();
  const universeData = useContext(UniverseDataContext);
  const layerData = useContext(LayerContext);
  const [cubesData, setCubesData] = useState<GeoInstanceData[]>([]);
  const [spheresData, setSpheresData] = useState<GeoInstanceData[]>([]);
  const [geoKey, setGeoKey] = useState(0);

  useEffect(() => {
    universeData.subscribeToGeometry(
      definedAndNotNull(layerData, "geometry layer requires device context")
        .deviceId,
      dataSource,
      (d) => {
        if (typeof d === "symbol") {
          console.warn("geometry received error from universe data");
          return;
        }
        const markerArray = d as IMarker3DArray;
        world.processMarkers(markerArray);
        const geometry = world.getAllGeometry();
        const cubes = geometry.filter(
          (g) => g.type === "cube"
        ) as GeoInstanceData[];
        const spheres = geometry.filter(
          (g) => g.type === "sphere"
        ) as GeoInstanceData[];

        geometry.forEach((g) => {
          if (g.dirty) {
            const mesh = worldGeometry.get(g.id);
            if (g.type === "line_list") {
              if (!mesh) {
                const material = new LineBasicMaterial({
                  color: new Color(g.color.r, g.color.g, g.color.b),
                  opacity: g.color.a,
                });

                const meshGeometry = new BufferGeometry().setFromPoints(
                  g.points as Vector3[]
                );
                const lines = new Line(meshGeometry, material);
                lines.position.set(g.position.x, g.position.y, g.position.z);
                lines.scale.set(g.scale.x, g.scale.y, g.scale.z);
                lines.rotation.set(g.rotation.x, g.rotation.y, g.rotation.z);

                root.add(lines);
                worldGeometry.set(g.id, lines);
              } else {
                mesh.geometry.setFromPoints(g.points as Vector3[]);
                mesh.position.set(g.position.x, g.position.y, g.position.z);
                mesh.scale.set(g.scale.x, g.scale.y, g.scale.z);
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
                // make things less blurrier
                const pixelScale = 4;
                // scale sprite so it isn't stretched
                sprite.scale.set(
                  1 / pixelScale,
                  textHeight / textWidth / pixelScale,
                  1.0 / pixelScale
                );
                root.add(sprite);
                worldGeometry.set(g.id, sprite);
              } else {
                mesh.material = spriteMaterial;
              }
            } else if (g.type === "arrow") {
              if (!mesh) {
                const material = new LineBasicMaterial({
                  color: new Color(g.color.r, g.color.g, g.color.b),
                  opacity: g.color.a,
                });

                const meshGeometry = new BufferGeometry().setFromPoints(
                  g.points as Vector3[]
                );
                const lines = new Line(meshGeometry, material);
                lines.position.set(g.position.x, g.position.y, g.position.z);
                lines.scale.set(g.scale.x, g.scale.y, g.scale.z);
                lines.rotation.set(g.rotation.x, g.rotation.y, g.rotation.z);

                root.add(lines);
                worldGeometry.set(g.id, lines);
              } else {
                mesh.geometry.setFromPoints(g.points as Vector3[]);
                mesh.position.set(g.position.x, g.position.y, g.position.z);
                mesh.scale.set(g.scale.x, g.scale.y, g.scale.z);
                mesh.rotation.set(g.rotation.x, g.rotation.y, g.rotation.z);
                mesh.material = new LineBasicMaterial({
                  color: new Color(g.color.r, g.color.g, g.color.b),
                  opacity: g.color.a,
                });
              }
            }
            g.dirty = false;
          }
        });

        const oldGeoIds = [...worldGeometry.keys()];
        const newGeoIds = new Set(geometry.map((g) => g.id));
        const toRemove = oldGeoIds.filter((id) => !newGeoIds.has(id));
        toRemove.forEach((id) => {
          root.remove(defined(worldGeometry.get(id)));
          worldGeometry.delete(id);
        });
        startTransition(() => {
          setCubesData(cubes);
          setSpheresData(spheres);
          setGeoKey((k) => k + 1)
        })
      }
    );
  }, []);
  return (
    <DataVisualizationLayer {...props} iconUrl="icons/3d_object.svg">
      <group>
        <primitive object={root} />
        {cubesData.length > 0 && (
          <InstancedGeometry instances={cubesData} key={geoKey} />
        )}
        {spheresData.length > 0 && (
          <InstancedGeometry instances={spheresData} key={geoKey} />
        )}
      </group>
      {children}
    </DataVisualizationLayer>
  );
}
