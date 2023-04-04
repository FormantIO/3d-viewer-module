import React, { forwardRef, useEffect, useRef } from "react";
import { IPose } from "@formant/universe-core";
import * as THREE from "three";
import { extend, ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import { PivotControls } from "@react-three/drei";
import { useControlsContext } from "../common/ControlsContext";
import { FormantColors } from "../utils/FormantColors";
import { CircleMaterial } from "../utils/CircleMaterial";
extend({ CircleMaterial });

interface Props {
  pose: IPose;
  onPose: (pose: IPose) => void;
  toggle?: boolean;
  pointIndex: number;
}

export type WaypointData = {
  pointIndex: number;
  pose: IPose;
} & any;

export const Waypoint = forwardRef<THREE.Group, Props>((props, ref) => {
  const { pose, pointIndex } = props;
  const {
    updateState,
    state: { selectedWaypoint },
  } = useControlsContext();

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
      new THREE.Vector2(0, 0.65),
      new THREE.Vector2(0.4, 0.2)
    );
    const points = c.getPoints(7);
    points.push(new THREE.Vector2(0, 0.8));
    return new THREE.Shape(points);
  }, []);

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    updateState({ selectedWaypoint: pointIndex });
  };

  useFrame(({ camera }) => {
    if (!groupRef.current) return;
    const marker = groupRef.current;
    const scale = marker.position.distanceTo(camera.position) / 25;
    marker.scale.setScalar(scale);
  });

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
        scale={2}
        matrix={matrix}
        autoTransform={false}
        onDragStart={() => {
          if (!controls) return;
          (controls as any).enabled = false;
        }}
        onDrag={(m) => {
          if (selectedWaypoint !== pointIndex) return;
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
                z: 0.15,
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
          <mesh
            name="circle"
            onClick={onClick}
            position-z={0.1}
            renderOrder={2}
          >
            <circleGeometry args={[0.38, 20]} />
            <circleMaterial
              args={[
                selectedWaypoint !== pointIndex
                  ? FormantColors.purple
                  : FormantColors.blue,
                selectedWaypoint !== pointIndex ? "white" : FormantColors.blue,
              ]}
            />
          </mesh>
        </group>
      </PivotControls>

      <mesh
        name="arrow"
        rotation={[0, 0, -Math.PI / 2]}
        onClick={onClick}
        scale={1.2}
        position-z={0.1}
        renderOrder={2}
      >
        <shapeGeometry args={[arrowShape]} />
        <meshStandardMaterial color={"white"} depthTest={false} />
      </mesh>
    </group>
  );
});
