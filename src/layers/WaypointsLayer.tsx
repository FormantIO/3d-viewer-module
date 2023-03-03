import {
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { IUniverseLayerProps } from "./types";
import { UniverseDataContext } from "./common/UniverseDataContext";
import { LayerContext } from "./common/LayerContext";
import { DataVisualizationLayer } from "./DataVisualizationLayer";
import { IPose, UniverseTelemetrySource } from "@formant/universe-core";
import { Euler, Group, Matrix4, Mesh, Quaternion, Vector3 } from "three";
import { IUniversePointCloud } from "@formant/universe-core/dist/types/universe-core/src/model/IUniversePointCloud";
import { FormantColors } from "./utils/FormantColors";
import { ThreeEvent, useThree } from "@react-three/fiber";
import { Line, PivotControls } from "@react-three/drei";

interface IPointCloudProps extends IUniverseLayerProps {
  dataSource?: UniverseTelemetrySource;
}

export const WaypointsLayer = (props: IPointCloudProps) => {
  const { dataSource } = props;
  const universeData = useContext(UniverseDataContext);
  const layerData = useContext(LayerContext);

  const [points, setPoints] = useState<IPose[]>([]);

  const waypointRefs = useRef<(Group | null)[]>([]);

  useEffect(() => {
    if (!layerData) return;
    const { deviceId } = layerData;

    if (dataSource) {
      dataSource.streamType = "localization";
      const unsubscribe = universeData.subscribeToPointCloud(
        deviceId,
        dataSource,
        (data: IUniversePointCloud | Symbol) => {}
      );

      return () => {
        unsubscribe();
      };
    }
  }, [layerData, universeData]);

  const mouseDownHandler = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      if (!e.shiftKey) return;
      let p = e.point;
      setPoints([
        ...points,
        {
          translation: {
            x: p.x,
            y: p.y,
            z: p.z + 0.125,
          },
          rotation: {
            x: 0,
            y: 0,
            z: 0,
            w: 1,
          },
        },
      ]);
    },
    [points, setPoints]
  );

  const plane = useRef<Mesh>(null!);

  return (
    <DataVisualizationLayer {...props} iconUrl="icons/3d_object.svg">
      <group>
        <mesh onPointerDown={mouseDownHandler} ref={plane}>
          <planeGeometry args={[200, 200]} />
          <meshStandardMaterial color={FormantColors.green} />
        </mesh>

        <group name="waypoints">
          {points.map((pose: IPose, idx: number) => (
            <Waypoint
              key={idx}
              pose={pose}
              onPose={(updatedPose) => {
                const newPoints = [...points];
                newPoints[idx] = updatedPose;
                setPoints(newPoints);
              }}
            />
          ))}

          {points.length > 0 && (
            <Line
              points={points.map(({ translation: { x, y, z } }) => [x, y, z])}
              lineWidth={5}
              color="red"
            />
          )}
        </group>

        {/* {selectedWaypointIdx && (
          <PivotControls object={waypointRefs.current[selectedWaypointIdx]} />
        )} */}
      </group>
    </DataVisualizationLayer>
  );
};

interface Props {
  pose: IPose;
  onPose: (pose: IPose) => void;
  toggle?: boolean;
}

const Waypoint = forwardRef<Group, Props>((props, ref) => {
  const { pose } = props;

  const [hover, setHover] = useState(false);
  const [color, setColor] = useState("white");

  const { controls } = useThree();

  const position = new Vector3(
    pose.translation.x,
    pose.translation.y,
    pose.translation.z
  );
  const rotation = new Euler();
  const pq = new Quaternion();
  pq.set(pose.rotation.x, pose.rotation.y, pose.rotation.z, pose.rotation.w);
  rotation.setFromQuaternion(pq);
  const targetRef = useRef<THREE.Group>(null!);
  const pivotRef = useRef<THREE.Group>(null!);
  const groupRef = useRef<THREE.Group>(null!);
  const matrix = new Matrix4();

  useEffect(() => {
    setColor(hover ? "red" : "white");
  }, [hover, setColor]);

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      <PivotControls
        ref={pivotRef}
        lineWidth={4}
        activeAxes={[true, true, false]}
        rotation={[0, 0, Math.PI / 2]}
        offset={[0, 0, 0.1]}
        anchor={[0, 0, 0]}
        scale={20}
        matrix={matrix}
        autoTransform={false}
        onDragStart={() => {
          if (!controls) return;
          (controls as any).enabled = false;
        }}
        onDrag={(m) => {
          matrix.copy(m);
          if (targetRef.current && groupRef.current && pivotRef.current) {
            // get rotation out of matrix
            const targetEuler = new Euler();
            targetEuler.setFromRotationMatrix(matrix);
            // add base rotation
            targetEuler.x += rotation.x;
            targetEuler.y += rotation.y;
            targetEuler.z += rotation.z;
            const n = new Quaternion();
            n.setFromEuler(targetEuler);
            const groupWorldPos = new Vector3();
            const targetWorldPos = new Vector3();
            groupRef.current.getWorldPosition(groupWorldPos);
            targetRef.current.getWorldPosition(targetWorldPos);
            const targetOffset = targetWorldPos.sub(groupWorldPos);

            const currentPose = {
              translation: {
                x: position.x + targetOffset.x,
                y: position.y + targetOffset.y,
                z: position.z + targetOffset.z,
              },
              rotation: {
                x: n.x,
                y: n.y,
                z: n.z,
                w: n.w,
              },
            };
            props.onPose(currentPose);
          }
        }}
      >
        <group ref={targetRef} />
        <group ref={ref}>
          <mesh
            onPointerOver={() => setHover(true)}
            onPointerLeave={() => setHover(false)}
          >
            <coneGeometry args={[4, 15, 32]} />
            <meshBasicMaterial color={color} />
          </mesh>
        </group>
      </PivotControls>
    </group>
  );
});
