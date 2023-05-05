import React, { forwardRef, useRef } from "react";
import { IPose } from "@formant/universe-core";
import * as THREE from "three";
import { extend, ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import { PivotControls } from "./PivotControls";
import { useControlsContext } from "../common/ControlsContext";
import { FormantColors } from "../utils/FormantColors";
import { CircleMaterial } from "../utils/CircleMaterial";
import { PathType } from "../types";
extend({ CircleMaterial });

interface Props {
  pose: IPose;
  onPose: (pose: IPose) => void;
  toggle?: boolean;
  pointIndex: number;
  pathType: PathType;
  pathWidth: number;
}

export type WaypointData = {
  pointIndex: number;
  pose: IPose;
} & any;

export const Waypoint = forwardRef<THREE.Group, Props>((props, ref) => {
  const { pose, pointIndex, pathType, pathWidth } = props;
  const {
    updateState,
    state: { selectedWaypoint, isWaypointEditing },
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
  const arrowGroupRef = useRef<THREE.Group>(null!);
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

  useFrame(({ camera, size: { height } }) => {
    if (!targetRef.current || !groupRef.current) return;
    const factor = height > 600 ? 25 : 25 * (height / 600);
    let scale = groupRef.current.position.distanceTo(camera.position) / factor;

    if (pathType === PathType.STATIC) scale = (pathWidth * 55) / factor;

    targetRef.current.scale.setScalar(scale);
    arrowGroupRef.current.scale.setScalar(scale);
  });

  const isPivotVisible = selectedWaypoint === pointIndex && isWaypointEditing;

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      <PivotControls
        ref={pivotRef}
        visible={isPivotVisible}
        lineWidth={6}
        axisColors={["#EA719D", "#2EC495", "#F9C36E"]}
        hoveredColor={"#18D2FF"}
        activeAxes={[true, true, false]}
        rotation={[0, 0, Math.PI / 2]}
        offset={[isPivotVisible ? 0 : 10e6, 0, 0.02]}
        anchor={[0, 0, 0]}
        scale={100}
        matrix={matrix}
        fixed
        autoTransform={false}
        onDragStart={() => {
          if (!controls) return;
          (controls as any).enabled = false;
        }}
        onDrag={(m) => {
          if (selectedWaypoint !== pointIndex || !isWaypointEditing) return;
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
                z: 0,
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
          <mesh name="circle" onClick={onClick} renderOrder={2}>
            <circleGeometry args={[0.38, 36]} />
            <circleMaterial
              args={[
                selectedWaypoint !== pointIndex
                  ? FormantColors.purple
                  : "#18D2FF",
                "#ffffff",
              ]}
            />
          </mesh>
        </group>
      </PivotControls>

      <group ref={arrowGroupRef}>
        <mesh
          name="arrow"
          rotation={[0, 0, -Math.PI / 2]}
          scale={1.2}
          renderOrder={2}
        >
          <shapeGeometry args={[arrowShape]} />
          <meshStandardMaterial color={"white"} depthTest={false} />
        </mesh>
      </group>
    </group>
  );
});
