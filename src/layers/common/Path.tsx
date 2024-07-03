import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { Line } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import { PathGeometry } from "../utils/PathGeometry";
import { PathType } from "../types";
extend({ PathGeometry });

interface IPathProps {
  points: THREE.Vector3[];
  color?: string;
  pathOpacity?: number;
  pathWidth?: number;
  pathType?: PathType;
  pathFlatten?: boolean;
  renderOrder?: number;
}

const Path: React.FC<IPathProps> = ({
  points,
  color = "#0000ff", // Default color (blue)
  pathOpacity = 50,
  pathWidth = 0.25,
  pathType = PathType.STATIC,
  pathFlatten = false,
  renderOrder = 0,
}) => {
  const groupRef = useRef<THREE.Group>(null!);

  useEffect(() => {
    if (!groupRef.current) return;
    const group = groupRef.current;
    group.matrixAutoUpdate = false;
  }, []);
  const _points = pathFlatten ? points.map((p) => p.setZ(0)) : points;

  return (
    <group ref={groupRef}>
      {points.length > 1 && (
        <>
          {pathType === PathType.STATIC ? (
            <mesh renderOrder={renderOrder}>
              <pathGeometry args={[_points, pathWidth, points.length]} />
              <meshBasicMaterial
                transparent
                opacity={pathOpacity / 100}
                color={color}
                side={THREE.DoubleSide}
                depthWrite={false}
              />
            </mesh>
          ) : (
            <Line
              points={_points}
              lineWidth={18}
              color={color}
              worldUnits={false}
              renderOrder={renderOrder}
            />
          )}
        </>
      )}
    </group>
  );
};

export default Path;
