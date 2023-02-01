import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import React from "react";
import { FormantColors } from "./FormantColors";
import {
  EffectComposer,
  // DepthOfField,
  Bloom,
  Noise,
  Vignette,
} from "@react-three/postprocessing";
import { VRButton, XR, Controllers, Hands } from "@react-three/xr";
import { BlendFunction } from "postprocessing";
import Sidebar from "./components/Sidebar";
import { UIDataContext, useUI } from "./UIDataContext";

const query = new URLSearchParams(window.location.search);
const shouldUseVR = query.get("vr") === "true";
const fancy = query.get("fancy") === "true";

type IUniverseProps = {
  children?: React.ReactNode;
};

export function Universe(props: IUniverseProps) {
  const vr = shouldUseVR;
  const { layers, register, toggleVisibility } = useUI();
  return (
    <>
      <UIDataContext.Provider value={{ layers, register, toggleVisibility }}>
        {vr && <VRButton />}
        <Canvas color="red">
          <XR>
            <color attach="background" args={[FormantColors.flagship]} />
            <OrbitControls />
            <group>{props.children}</group>
            {fancy && (
              <EffectComposer>
                {/* <DepthOfField
                  focusDistance={0}
                  focalLength={0.02}
                  bokehScale={2}
                  height={480}
                /> */}
                <Bloom mipmapBlur intensity={1.0} luminanceThreshold={0.5} />
                <Noise opacity={0.02} />
                <Vignette
                  offset={0.3}
                  darkness={0.9}
                  blendFunction={BlendFunction.NORMAL}
                />
              </EffectComposer>
            )}
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
        <Sidebar />
      </UIDataContext.Provider>
    </>
  );
}
