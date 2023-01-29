import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import React from "react";
import { Axis } from "./components/Axis";
import { FormantColors } from "./FormantColors";

type IUniverseProps = {
  children?: React.ReactNode;
};

export function Universe(props: IUniverseProps) {
  return (
    <Canvas color="red">
      <color attach="background" args={[FormantColors.flagship]} />
      <OrbitControls />
      <group rotation={[Math.PI / 2, 0, 0]}>{props.children}</group>
    </Canvas>
  );
}
