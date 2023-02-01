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
import Sidebar from "./components/Sidebar";
import { UIDataContext, useUI } from "./UIDataContext";

const query = new URLSearchParams(window.location.search);
const shouldUseVR = query.get("vr") === "true";

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
            <group rotation={vr ? undefined : [Math.PI / 2, 0, 0]}>
              {props.children}
            </group>
            {!vr && (
              <EffectComposer>
                <DepthOfField
                  focusDistance={0}
                  focalLength={0.02}
                  bokehScale={2}
                  height={480}
                />
                <Bloom
                  luminanceThreshold={0}
                  luminanceSmoothing={0.9}
                  height={300}
                />
                <Noise opacity={0.02} />
                <Vignette eskil={false} offset={0.1} darkness={1.1} />
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
