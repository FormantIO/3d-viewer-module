import {
  definedAndNotNull,
  UniverseDataSource,
  UniverseTelemetrySource,
} from "@formant/data-sdk";
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
  Float32BufferAttribute,
  InstancedMesh,
  Line,
  LineBasicMaterial,
  LineSegments,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  Object3D,
  Points,
  PointsMaterial,
  Sprite,
  SpriteMaterial,
  Texture,
  Vector3,
} from "three";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils";
import { LayerContext } from "./common/LayerContext";
import { Arrow, Geometry, GeometryWorld, Text } from "./objects/GeometryWorld";
import { UniverseDataContext } from "./common/UniverseDataContext";
import { DataVisualizationLayer } from "./DataVisualizationLayer";
import { IUniverseLayerProps } from "./types";
import { Box, Sphere } from "@react-three/drei";
import { IMarker3DArray } from "@formant/data-sdk";
import getUuidByString from "uuid-by-string";
import { useBounds } from "./common/CustomBounds";
import { duration } from "../common/duration";

// minimum time difference between two updates to consider them separate
const MINIMUM_TIME_DIFFERENCE = 12 * duration.hour;

interface IGeometryLayer extends IUniverseLayerProps {
  dataSource: UniverseDataSource;
  allowTransparency: boolean;
}

type GeoInstanceData = {
  id: string;
  type: string;
  position: { x: number; y: number; z: number };
  rotation: { w: number; x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  color: { r: number; g: number; b: number; a: number };
  colors?: { r: number; g: number; b: number }[];
  dirty: boolean;
  points?: { x: number; y: number; z: number }[];
};

type InstancedGeoProps = {
  instances: GeoInstanceData[];
  allowTransparency?: boolean;
};

type InstanceGeoListProps = {
  instances: GeoInstanceData;
};

function InstancedGeometry({
  instances,
  allowTransparency,
}: InstancedGeoProps) {
  const ref = useRef<InstancedMesh>(null);
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
      if (ref.current) {
        instances.forEach((data, index) => {
          const { position, rotation, scale, color } = data;

          const transformKey = getUuidByString(
            `${data.id}-${position.x}${position.y}${position.z}${rotation.x}${rotation.y}${rotation.z}${rotation.w}${scale.x}${scale.y}${scale.z}`
          );

          let instanceMatrix = matrixCache.current.get(transformKey);
          if (!instanceMatrix) {
            dummy.position.set(position.x, position.y, position.z);
            dummy.quaternion.set(
              rotation.x,
              rotation.y,
              rotation.z,
              rotation.w
            );
            dummy.scale.set(scale.x, scale.y, scale.z);
            boundingBox.current.expandByPoint(dummy.position);

            dummy.updateMatrix();
            instanceMatrix = dummy.matrix.clone();
            matrixCache.current.set(transformKey, dummy.matrix.clone());
          }

          ref.current!.setMatrixAt(index, instanceMatrix);
          ref.current!.setColorAt(index, new Color(color.r, color.g, color.b));
        });
        ref.current.up = new Vector3(0, 0, 1);
        ref.current.instanceMatrix.needsUpdate = true;
        if (ref.current.instanceColor) {
          ref.current.instanceColor.needsUpdate = true;
        }
      }
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
                  scale={[data.scale.x, data.scale.y, data.scale.z]}
                  position={[data.position.x, data.position.y, data.position.z]}
                  quaternion={[
                    data.rotation.x,
                    data.rotation.y,
                    data.rotation.z,
                    data.rotation.w,
                  ]}
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
                  scale={[data.scale.x, data.scale.y, data.scale.z]}
                  position={[data.position.x, data.position.y, data.position.z]}
                  quaternion={[
                    data.rotation.x,
                    data.rotation.y,
                    data.rotation.z,
                    data.rotation.w,
                  ]}
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
          up={new Vector3(0, 0, 1)}
        >
          {type === "sphere" ? (
            <sphereGeometry
              attach="geometry"
              args={[0.5, 32, 16]}
            ></sphereGeometry>
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

function InstancedGeometryFromList({ instances }: InstanceGeoListProps) {
  if (!instances.points) {
    return null;
  }
  const ref = useRef<InstancedMesh>(null);
  const boundingBox = useRef<Box3>(new Box3());
  const type = instances.type;

  const matrixCache = useRef<Map<string, Matrix4>>(new Map());
  const dummy = useMemo(() => new Object3D(), []);

  useLayoutEffect(() => {
    if (instances.points === undefined) {
      return;
    }
    if (ref.current) {
      boundingBox.current.setFromCenterAndSize(
        new Vector3(
          instances.position.x,
          instances.position.y,
          instances.position.z
        ),
        new Vector3(0.1, 0.1, 0.1)
      );
      // every three numbers in points is a position vector3
      const positions = instances.points;
      const rootPosition = instances.position;
      const colors = instances.colors;
      const scale = instances.scale;

      positions.map((pos, index) => {
        const transformKey = getUuidByString(
          `${index}-${pos.x}${pos.y}${pos.z}`
        );
        let instanceMatrix = matrixCache.current.get(transformKey);
        if (!instanceMatrix) {
          dummy.position.set(
            rootPosition.x + pos.x,
            rootPosition.y + pos.y,
            rootPosition.z + pos.z
          );
          dummy.scale.set(scale.x, scale.y, scale.z);
          dummy.updateMatrix();

          instanceMatrix = dummy.matrix.clone();
          matrixCache.current.set(transformKey, dummy.matrix.clone());
        }
        boundingBox.current.expandByPoint(dummy.position);
        if (ref.current) {
          ref.current.up = new Vector3(0, 0, 1);
          ref.current.setMatrixAt(index, instanceMatrix);

          // for lists, per object colors are optional
          if (colors && colors[index]) {
            ref.current.setColorAt(
              index,
              new Color(colors[index].r, colors[index].g, colors[index].b)
            );
          } else {
            ref.current.setColorAt(
              index,
              new Color(instances.color.r, instances.color.g, instances.color.b)
            );
          }
        }
      });
      // update the instanceMatrix and instanceColor once
      if (ref.current) {
        ref.current.instanceMatrix.needsUpdate = true;
        if (ref.current.instanceColor) {
          ref.current.instanceColor.needsUpdate = true;
        }
      }
    }
  }, [ref, instances]);

  return (
    <>
      <instancedMesh
        ref={ref}
        args={[null as any, null as any, instances.points.length]}
        up={new Vector3(0, 0, 1)}
      >
        {type === "sphere_list" ? (
          <sphereGeometry
            attach="geometry"
            args={[0.5, 32, 16]}
          ></sphereGeometry>
        ) : null}
        {type === "cube_list" ? (
          <boxGeometry attach="geometry" args={[0.9, 0.9, 0.9]}></boxGeometry>
        ) : null}
        <meshLambertMaterial attach="material" />
      </instancedMesh>
      <box3Helper args={[boundingBox.current]} visible={false} />
    </>
  );
}

export function GeometryLayer(props: IGeometryLayer) {
  const { children, dataSource, allowTransparency } = props;

  const world = useRef(new GeometryWorld());
  const isReady = useRef(false);
  const bounds = useBounds();

  const worldGeometry: MutableRefObject<
    Map<string, Mesh | Line | Sprite | Points>
  > = useRef(new Map());

  const rootRef = useRef(new Object3D());
  const [universeData, liveUniverseData] = useContext(UniverseDataContext);
  const lastTimeRef = useRef(universeData.getTimeMs());
  const layerData = useContext(LayerContext);
  const [cubesData, setCubesData] = useState<GeoInstanceData[]>([]);
  const [spheresData, setSpheresData] = useState<GeoInstanceData[]>([]);
  const [cubeList, setCubeList] = useState<GeoInstanceData[]>([]);
  const [sphereList, setSphereList] = useState<GeoInstanceData[]>([]);

  const removeObsoleteGeometry = (toRemove: string[]) => {
    toRemove.forEach((id) => {
      const mesh = worldGeometry.current.get(id);
      if (mesh) {
        rootRef.current.remove(mesh);
        worldGeometry.current.delete(id);
      }
    });
  };

  const createTextMaterial = (geometry: Text) => {
    const fontface = "Arial";
    const fontsize = 30;
    const message = geometry.text;
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
    return { spriteMaterial, textHeight, textWidth };
  };

  const processArrowMarker = (g: Arrow, mesh: Mesh) => {
    // less than two points means we are drawing based on position, scale, and rotation
    if (g.points.length < 2) {
      mesh.position.set(g.position.x, g.position.y, g.position.z);
      mesh.scale.set(g.scale.x, g.scale.z, g.scale.y);
      mesh.quaternion.set(
        g.rotation.x,
        g.rotation.y,
        g.rotation.z,
        g.rotation.w
      );
    } else {
      // two points means we are drawing based on start and end points
      const start = new Vector3(g.points[0].x, g.points[0].y, g.points[0].z);
      const end = new Vector3(g.points[1].x, g.points[1].y, g.points[1].z);
      const dir = new Vector3().subVectors(end, start);
      const length = dir.length();
      const arrowDir = dir.normalize();
      mesh.position.set(start.x, start.y, start.z);
      mesh.scale.set(1, length, 1);
      mesh.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), arrowDir);
    }
  };

  const createGeometryMesh = (g: Geometry) => {
    if (g.type === "line_list" || g.type === "line_strip") {
      const material = new LineBasicMaterial({
        color: new Color(g.color.r, g.color.g, g.color.b),
        opacity: g.color.a,
        linewidth: 1, // with webGL this is always 1, webGPU will fix this someday
      });

      const meshGeometry = new BufferGeometry().setFromPoints(
        g.points as Vector3[]
      );
      const lines =
        g.type === "line_list"
          ? new LineSegments(meshGeometry, material)
          : new Line(meshGeometry, material);
      if (g.colors) {
        lines.geometry.setAttribute(
          "color",
          new Float32BufferAttribute(
            g.colors.map((c) => [c.r, c.g, c.b]).flat(),
            3
          )
        );
        lines.material.vertexColors = true;
      }

      lines.position.set(g.position.x, g.position.y, g.position.z);
      lines.quaternion.set(
        g.rotation.x,
        g.rotation.y,
        g.rotation.z,
        g.rotation.w
      );

      rootRef.current.add(lines);
      worldGeometry.current.set(g.id, lines);
    } else if (g.type === "text") {
      const { spriteMaterial, textHeight, textWidth } = createTextMaterial(g);

      const sprite = new Sprite(spriteMaterial);
      const pixelScale = 1;

      // scale sprite so it isn't stretched
      sprite.scale.set(
        1 / pixelScale,
        textHeight / textWidth / pixelScale,
        1.0 / pixelScale
      );
      sprite.position.set(g.position.x, g.position.y, g.position.z);
      rootRef.current.add(sprite);
      worldGeometry.current.set(g.id, sprite);
    } else if (g.type === "arrow") {
      const material = new MeshLambertMaterial({
        color: new Color(g.color.r, g.color.g, g.color.b),
        opacity: g.color.a,
      });

      const shaftDiameter = g.points.length < 2 ? 0.01 : g.scale.x;
      const headDiameter = g.points.length < 2 ? 0.05 : g.scale.y;
      const headLength = g.points.length < 2 && g.scale.z ? 0.1 : g.scale.z;
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
      const arrowGeometry = BufferGeometryUtils.mergeGeometries([
        arrowShaft,
        arrowHead,
      ]);
      const arrowMesh = new Mesh(arrowGeometry, material);

      processArrowMarker(g, arrowMesh);

      rootRef.current.add(arrowMesh);
      worldGeometry.current.set(g.id, arrowMesh);
    } else if (g.type === "cylinder") {
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
      cylinderMesh.quaternion.set(
        g.rotation.x,
        g.rotation.y,
        g.rotation.z,
        g.rotation.w
      );

      rootRef.current.add(cylinderMesh);
      worldGeometry.current.set(g.id, cylinderMesh);
    } else if (g.type === "points") {
      const serializedPoints = g.points.map((p) => {
        return new Vector3(p.x, p.y, p.z);
      });
      const material = new PointsMaterial({
        color: new Color(g.color.r, g.color.g, g.color.b),
        opacity: g.color.a,
        size: g.scale.x / 10,
      });

      const pointsGeometry = new BufferGeometry().setFromPoints(
        serializedPoints as Vector3[]
      );
      const pointsMesh = new Points(pointsGeometry, material);
      if (g.colors) {
        pointsMesh.geometry.setAttribute(
          "color",
          new Float32BufferAttribute(
            g.colors.map((c) => [c.r, c.g, c.b]).flat(),
            3
          )
        );
        pointsMesh.material.vertexColors = true;
      }

      pointsMesh.position.set(g.position.x, g.position.y, g.position.z);
      pointsMesh.quaternion.set(
        g.rotation.x,
        g.rotation.y,
        g.rotation.z,
        g.rotation.w
      );

      rootRef.current.add(pointsMesh);
      worldGeometry.current.set(g.id, pointsMesh);
    } else if (g.type === "triangle_list") {
      const serializedPoints = g.points.map((p) => {
        return new Vector3(p.x, p.y, p.z);
      });
      const material = new MeshBasicMaterial({
        color: new Color(g.color.r, g.color.g, g.color.b),
        opacity: g.color.a,
      });

      const trianglesGeometry = new BufferGeometry().setFromPoints(
        serializedPoints as Vector3[]
      );
      const trianglesMesh = new Mesh(trianglesGeometry, material);

      if (g.colors) {
        trianglesMesh.geometry.setAttribute(
          "color",
          new Float32BufferAttribute(
            g.colors
              .map(
                (c) => [c.r, c.g, c.b, c.r, c.g, c.b, c.r, c.g, c.b] // 3 times for each vertex
              )
              .flat(),
            3
          )
        );
        trianglesMesh.material.vertexColors = true;
      }

      trianglesMesh.position.set(g.position.x, g.position.y, g.position.z);
      trianglesMesh.scale.set(g.scale.x, g.scale.z, g.scale.y);
      trianglesMesh.quaternion.set(
        g.rotation.x,
        g.rotation.y,
        g.rotation.z,
        g.rotation.w
      );

      rootRef.current.add(trianglesMesh);
      worldGeometry.current.set(g.id, trianglesMesh);
    }
  };

  const updateGeometryMesh = (
    g: Geometry,
    mesh: Mesh | Line | Sprite | Points
  ) => {
    if (g.type === "line_list" || g.type === "line_strip") {
      mesh.geometry.setFromPoints(g.points as Vector3[]);
      mesh.position.set(g.position.x, g.position.y, g.position.z);
      mesh.quaternion.set(
        g.rotation.x,
        g.rotation.y,
        g.rotation.z,
        g.rotation.w
      );
      mesh.material = new LineBasicMaterial({
        color: new Color(g.color.r, g.color.g, g.color.b),
        opacity: g.color.a,
      });
    } else if (g.type === "text") {
      const { spriteMaterial } = createTextMaterial(g);
      mesh.material = spriteMaterial;
    } else if (g.type === "arrow" && mesh instanceof Mesh) {
      processArrowMarker(g, mesh);
      mesh.material = new MeshLambertMaterial({
        color: new Color(g.color.r, g.color.g, g.color.b),
        opacity: g.color.a,
      });
    } else if (g.type === "cylinder") {
      mesh.position.set(g.position.x, g.position.y, g.position.z);
      mesh.scale.set(g.scale.x, g.scale.z, g.scale.y);
      mesh.quaternion.set(
        g.rotation.x,
        g.rotation.y,
        g.rotation.z,
        g.rotation.w
      );
      mesh.material = new MeshLambertMaterial({
        color: new Color(g.color.r, g.color.g, g.color.b),
        opacity: g.color.a,
      });
    } else if (g.type === "points") {
      mesh.geometry.setFromPoints(g.points as Vector3[]);
      mesh.position.set(g.position.x, g.position.y, g.position.z);
      mesh.quaternion.set(
        g.rotation.x,
        g.rotation.y,
        g.rotation.z,
        g.rotation.w
      );
      mesh.material = new PointsMaterial({
        color: new Color(g.color.r, g.color.g, g.color.b),
        opacity: g.color.a,
        size: g.scale.x / 10,
      });
      if (g.colors) {
        mesh.geometry.setAttribute(
          "color",
          new Float32BufferAttribute(
            g.colors.map((c) => [c.r, c.g, c.b]).flat(),
            3
          )
        );
        mesh.material.vertexColors = true;
      }
    } else if (g.type === "triangle_list") {
      mesh.geometry.setFromPoints(g.points as Vector3[]);
      mesh.scale.set(g.scale.x, g.scale.y, g.scale.z);
      mesh.position.set(g.position.x, g.position.y, g.position.z);
      mesh.quaternion.set(
        g.rotation.x,
        g.rotation.y,
        g.rotation.z,
        g.rotation.w
      );
      mesh.material = new MeshBasicMaterial({
        color: new Color(g.color.r, g.color.g, g.color.b),
        opacity: g.color.a,
      });
      if (g.colors) {
        mesh.geometry.setAttribute(
          "color",
          new Float32BufferAttribute(
            g.colors
              .map(
                (c) => [c.r, c.g, c.b, c.r, c.g, c.b, c.r, c.g, c.b] // 3 times for each vertex
              )
              .flat(),
            3
          )
        );
        mesh.material.vertexColors = true;
      }
    }
  };

  const processGeometry = (geometry: Geometry[]) => {
    geometry.forEach((g) => {
      if (g.dirty) {
        const mesh = worldGeometry.current.get(g.id);
        if (!mesh) {
          createGeometryMesh(g);
        } else {
          updateGeometryMesh(g, mesh);
        }
        g.dirty = false;
      }
    });
  };

  useEffect(() => {
    const unsubscribe = (
      dataSource.sourceType === "realtime" ? liveUniverseData : universeData
    ).subscribeToGeometry(
      definedAndNotNull(layerData, "geometry layer requires device context")
        .deviceId,
      dataSource,
      (d) => {
        console.log("d", d);
        if (typeof d === "symbol") {
          return;
        }
        if (!isReady.current) {
          isReady.current = true;
        }
        const markerArray = d as IMarker3DArray;
        const currentTime = universeData.getTimeMs();
        if (
          Math.abs(currentTime - lastTimeRef.current) > MINIMUM_TIME_DIFFERENCE
        ) {
          world.current.deleteAll();
          removeObsoleteGeometry([...worldGeometry.current.keys()]);
        }
        lastTimeRef.current = currentTime;

        world.current.processMarkers(markerArray);
        const geometry = world.current.getAllGeometry();
        const cubes = geometry.filter(
          (g) => g.type === "cube"
        ) as GeoInstanceData[];
        const cubeList = geometry.filter(
          (g) => g.type === "cube_list"
        ) as GeoInstanceData[];
        const sphereList = geometry.filter(
          (g) => g.type === "sphere_list"
        ) as GeoInstanceData[];
        const spheres = geometry.filter(
          (g) => g.type === "sphere"
        ) as GeoInstanceData[];
        startTransition(() => {
          // let's avoid reprocessing cubes and spheres
          processGeometry(
            geometry.filter(
              (g) =>
                g.type !== "cube" &&
                g.type !== "cube_list" &&
                g.type !== "sphere" &&
                g.type !== "sphere_list"
            ) as Geometry[]
          );

          const oldGeoIds = [...worldGeometry.current.keys()];
          const newGeoIds = new Set(geometry.map((g) => g.id));
          const toRemove = oldGeoIds.filter((id) => !newGeoIds.has(id));

          removeObsoleteGeometry(toRemove);

          setCubesData(cubes);
          setSpheresData(spheres);
          setCubeList(cubeList);
          setSphereList(sphereList);
        });
      }
    );
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    bounds.refresh();
  }, [isReady.current]);

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
        {cubeList.map((cL) => (
          <InstancedGeometryFromList key={cL.id} instances={cL} />
        ))}
        {sphereList.map((sL) => (
          <InstancedGeometryFromList key={sL.id} instances={sL} />
        ))}
      </group>
      {children}
    </DataVisualizationLayer>
  );
}
