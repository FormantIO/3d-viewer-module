import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import React from "react";
import { Axis } from "./components/Axis";
import { FormantColors } from "./FormantColors";
import {
  EffectComposer,
  DepthOfField,
  Bloom,
  Noise,
  Vignette,
} from "@react-three/postprocessing";

type IUniverseProps = {
  children?: React.ReactNode;
};

export function Universe(props: IUniverseProps) {
  return (
    <Canvas color="red">
      <color attach="background" args={[FormantColors.flagship]} />
      <OrbitControls />
      <group rotation={[Math.PI / 2, 0, 0]}>{props.children}</group>
      <EffectComposer>
        <DepthOfField
          focusDistance={0}
          focalLength={0.02}
          bokehScale={2}
          height={480}
        />
        <Bloom luminanceThreshold={0} luminanceSmoothing={0.9} height={300} />
        <Noise opacity={0.02} />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
    </Canvas>
  );
}
