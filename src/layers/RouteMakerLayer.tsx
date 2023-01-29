import { Cylinder, GradientTexture, Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import React, { useContext, useEffect, useRef, useState } from "react";
import { Vector3 } from "three";
import { FormantColors } from "../FormantColors";
import { LayerDataContext } from "../LayerDataContext";
import { UniverseTelemetrySource } from "../model/DataSource";
import { UniverseDataContext } from "../UniverseDataContext";
import { TransformLayer } from "./TransformLayer";
import { IUniverseLayerProps } from "./types";

interface IMapLayer extends IUniverseLayerProps {
  size: number;
}

function Marker(props: { color: string; position: [number, number, number] }) {
  const { position, color } = props;
  const groupRef = useRef<THREE.Group>(null!);
  useFrame((state, delta) => {
    const g = groupRef.current;
    if (g) {
      g.rotateY(delta * 0.1);
    }
  });
  return (
    <group ref={groupRef} position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.26, 0]}>
        <planeGeometry args={[0.5, 0.5]} />
        <meshBasicMaterial>
          <GradientTexture
            stops={[0, 1]}
            colors={FormantColors.gradient01}
            size={1024}
          />
        </meshBasicMaterial>
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  );
}

export function RouteMakerLayer(props: IMapLayer) {
  const [points, setPoints] = useState<Vector3[]>([]);
  const { children, size } = props;

  return (
    <TransformLayer {...props}>
      <mesh
        onPointerDown={(e) => {
          setPoints([...points, e.point]);
        }}
      >
        <boxGeometry args={[size, 0.1, size]} />
        <meshPhongMaterial opacity={0} transparent />
      </mesh>
      {points.map((p: Vector3, i) => {
        const v: [number, number, number] = [p.x, p.z, -p.y];
        let lastv: [number, number, number] | undefined;
        if (i > 0) {
          lastv = [points[i - 1].x, points[i - 1].z, -points[i - 1].y];
        }
        return (
          <>
            {i > 0 && lastv !== undefined && (
              <Line
                points={[v, lastv]}
                color={FormantColors.silver}
                lineWidth={5}
              />
            )}
            <Marker
              color={i === 0 ? FormantColors.green : FormantColors.silver}
              position={v}
              key={"c_" + i}
            />
          </>
        );
      })}
      {children}
    </TransformLayer>
  );
}
