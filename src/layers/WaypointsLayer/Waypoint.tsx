import { forwardRef, useEffect, useRef, useState } from "react";
import { IPose } from "@formant/universe-core";
import { Euler, Group, Matrix4, Quaternion, Vector3 } from "three";
import { useThree } from "@react-three/fiber";
import { PivotControls } from "@react-three/drei";
import { Marker } from "./Marker";
import { useControlsContext } from "../common/ControlsContext";

interface Props {
  pose: IPose;
  onPose: (pose: IPose) => void;
  toggle?: boolean;
  pointIndex: number;
}

export type WaypointData = {
  pointIndex: number;
  message: string;
  scrubberOn: boolean;
  pose: IPose;
};

export const Waypoint = forwardRef<Group, Props>((props, ref) => {
  const { pose, pointIndex } = props;
  const {
    store,
    updateState,
    state: { selectedWaypoint },
  } = useControlsContext();

  // Init each waypoint metadata
  useEffect(() => {
    store.waypoints[pointIndex] = {
      pointIndex,
      message: "",
      scrubberOn: false,
      pose,
    };
  }, [store]);

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

  const markerClickHandler = () =>
    updateState({ selectedWaypoint: pointIndex });

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      <PivotControls
        ref={pivotRef}
        visible={selectedWaypoint === pointIndex}
        lineWidth={4}
        activeAxes={[true, true, false]}
        rotation={[0, 0, Math.PI / 2]}
        offset={[0, 0, 0.1]}
        anchor={[0, 0, 0]}
        scale={1.8}
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
          <Marker onClick={markerClickHandler} />
        </group>
      </PivotControls>
    </group>
  );
});
