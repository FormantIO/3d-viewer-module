import React, { forwardRef, useEffect, useRef } from "react";
import { IPose } from "@formant/universe-core";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { PivotControls } from "@react-three/drei";
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

export const Waypoint = forwardRef<THREE.Group, Props>((props, ref) => {
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

  const position = new THREE.Vector3(
    pose.translation.x,
    pose.translation.y,
    pose.translation.z
  );
  const rotation = new THREE.Euler();
  const pq = new THREE.Quaternion();
  pq.set(pose.rotation.x, pose.rotation.y, pose.rotation.z, pose.rotation.w);
  rotation.setFromQuaternion(pq);
  const targetRef = useRef<THREE.Group>(null!);
  const pivotRef = useRef<THREE.Group>(null!);
  const groupRef = useRef<THREE.Group>(null!);
  const matrix = new THREE.Matrix4();

  const arrowShape = React.useMemo(() => {
    const c = new THREE.QuadraticBezierCurve(
      new THREE.Vector2(-0.4, 0.2),
      new THREE.Vector2(0, 0.6),
      new THREE.Vector2(0.4, 0.2)
    );
    const points = c.getPoints(7);
    points.push(new THREE.Vector2(0, 0.8));
    return new THREE.Shape(points);
  }, []);

  const onClick = () => updateState({ selectedWaypoint: pointIndex });

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
        scale={100}
        matrix={matrix}
        autoTransform={false}
        fixed={true}
        onDragStart={() => {
          if (!controls) return;
          (controls as any).enabled = false;
        }}
        onDrag={(m) => {
          matrix.copy(m);
          if (targetRef.current && groupRef.current && pivotRef.current) {
            // get rotation out of matrix
            const targetEuler = new THREE.Euler();
            targetEuler.setFromRotationMatrix(matrix);
            // add base rotation
            targetEuler.x += rotation.x;
            targetEuler.y += rotation.y;
            targetEuler.z += rotation.z;
            const n = new THREE.Quaternion();
            n.setFromEuler(targetEuler);
            const groupWorldPos = new THREE.Vector3();
            const targetWorldPos = new THREE.Vector3();
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
        <group ref={targetRef}>
          <mesh name="circle" onClick={onClick}>
            <circleGeometry args={[0.3, 20]} />
            <meshBasicMaterial
              color={selectedWaypoint === pointIndex ? "red" : "white"}
              transparent={true}
              opacity={0.75}
            />
          </mesh>
        </group>
      </PivotControls>

      <mesh name="arrow" rotation={[0, 0, -Math.PI / 2]} onClick={onClick}>
        <shapeGeometry args={[arrowShape]} />
        <meshStandardMaterial color="white" transparent={true} opacity={0.75} />
      </mesh>
    </group>
  );
});
