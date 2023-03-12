import { GroupProps } from "@react-three/fiber";
import React, { useMemo } from "react";
import * as THREE from "three";

interface Props extends GroupProps {
  onClick: () => void;
}
export const Marker: React.FC<Props> = ({ onClick, ...otherProps }) => {
  const arrowShape = useMemo(() => {
    const c = new THREE.QuadraticBezierCurve(
      new THREE.Vector2(-0.4, 0.2),
      new THREE.Vector2(0, 0.6),
      new THREE.Vector2(0.4, 0.2)
    );
    const points = c.getPoints(7);
    points.push(new THREE.Vector2(0, 0.8));
    return new THREE.Shape(points);
  }, []);

  return (
    <group {...otherProps}>
      <mesh
        name="arrow"
        rotation={[0, 0, -Math.PI / 2]}
        renderOrder={1}
        onClick={onClick}
      >
        <shapeGeometry args={[arrowShape]} />
        <meshStandardMaterial
          color="white"
          emissive="white"
          emissiveIntensity={2}
          toneMapped={false}
        />
      </mesh>
      <mesh name="circle" onClick={onClick}>
        <circleGeometry args={[0.3, 20]} />
        <meshBasicMaterial color="white" />
      </mesh>
    </group>
  );
};
