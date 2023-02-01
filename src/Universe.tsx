import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import React from "react";
import { FormantColors } from "./FormantColors";
import {
  EffectComposer,
  DepthOfField,
  Bloom,
  Noise,
  Vignette,
} from "@react-three/postprocessing";
import { VRButton, ARButton, XR, Controllers, Hands } from "@react-three/xr";

const query = new URLSearchParams(window.location.search);
const shouldUseVR = query.get("vr") === "true";

type IUniverseProps = {
  children?: React.ReactNode;
};

export function Universe(props: IUniverseProps) {
  const vr = shouldUseVR;
  return (
    <>
      {vr && <VRButton />}
      <Canvas color="red">
        <XR>
          <color attach="background" args={[FormantColors.flagship]} />
          <OrbitControls />
          <group>{props.children}</group>
          {!vr && <EffectComposer></EffectComposer>}
          {vr && (
            <>
              <Controllers rayMaterial={{ color: "red" }} />
              <Hands />
              <mesh>
                <boxGeometry />
                <meshBasicMaterial color="blue" />
              </mesh>
            </>
          )}
        </XR>
      </Canvas>
    </>
  );
}
