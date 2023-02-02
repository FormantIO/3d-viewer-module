import { Canvas, ThreeElements, useFrame, useThree } from "@react-three/fiber";
import {
  MapControls,
  OrbitControls,
  PerspectiveCamera,
} from "@react-three/drei";
import React, { useEffect } from "react";
import { FormantColors } from "../utils/FormantColors";
import {
  EffectComposer,
  // DepthOfField,
  Bloom,
  Noise,
  Vignette,
} from "@react-three/postprocessing";
import { VRButton, XR, Controllers, Hands } from "@react-three/xr";
import { BlendFunction } from "postprocessing";
import Sidebar from "../../components/Sidebar";
import { UIDataContext, useUI } from "./UIDataContext";
import { Scene, Vector3 } from "three";

const query = new URLSearchParams(window.location.search);
const shouldUseVR = query.get("vr") === "true";
const fancy = query.get("fancy") === "true";
const DEFAULT_CAMERA_POSITION = new Vector3(0, 40, 40);


type IUniverseProps = {
  children?: React.ReactNode;
};

export function Universe(props: IUniverseProps) {
  const [scene, setScene] = React.useState<Scene | null>(null!);
  const mapControlsRef = React.useRef<any>(null!);

  const lookAtTargetId = React.useCallback(
    (targetId: string) => {
      const m = mapControlsRef.current;
      if (m && scene) {
        const target = scene.getObjectByName(targetId);
        if (target) {
          const targetPosition = target.getWorldPosition(new Vector3());
          m.target.set(targetPosition.x, targetPosition.y, targetPosition.z);
          m.object.position.set(
            targetPosition.x,
            targetPosition.y,
            DEFAULT_CAMERA_POSITION.z
          );
          m.update();
        }
      }
    },
    [scene]
  );

  const vr = shouldUseVR;
  const {
    layers,
    register,
    toggleVisibility,
    cameraTargetId,
    setCameraTargetId,
  } = useUI();
  return (
    <>
      <UIDataContext.Provider
        value={{
          layers,
          register,
          toggleVisibility,
          cameraTargetId,
          setCameraTargetId,
        }}
      >
        {vr && <VRButton />}
        <Canvas
          onCreated={(state) => {
            setScene(state.scene);
          }}
        >
          <XR>
            <color attach="background" args={[FormantColors.flagship]} />
            <MapControls enableDamping={false} ref={mapControlsRef} />
            <PerspectiveCamera
              makeDefault
              position={[0, 0, 300]}
              up={[0, 0, 1]}
              far={5000}
            />
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
        <Sidebar lookAtTargetId={lookAtTargetId} />
      </UIDataContext.Provider>
    </>
  );
}
