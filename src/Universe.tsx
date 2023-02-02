import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { MapControls, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import React, { useEffect } from "react";
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
import { Vector3 } from "three";

const query = new URLSearchParams(window.location.search);
const shouldUseVR = query.get("vr") === "true";
const fancy = query.get("fancy") === "true";

type IUniverseProps = {
  children?: React.ReactNode;
};

const CameraTargetListener = ({ targetId }: { targetId: string }) => {
  const { scene, camera } = useThree();
  useEffect(() => {
    if (targetId) {
      const target = scene.getObjectByName(targetId);
      if (target) {
        const targetPosition = target.getWorldPosition(new Vector3());
        console.log(target);
        camera.position.set(targetPosition.x, targetPosition.y, targetPosition.z + 300);
        camera.lookAt(camera.position.x, camera.position.y, 0);

        console.log(camera);
      }
    }
  }, [targetId]);

  return null;
}

export function Universe(props: IUniverseProps) {
  const vr = shouldUseVR;
  const { layers, register, toggleVisibility, cameraTargetId, setCameraTargetId } = useUI();
  return (
    <>
      <UIDataContext.Provider value={{ layers, register, toggleVisibility, cameraTargetId, setCameraTargetId }}>
        {vr && <VRButton />}
        <Canvas>
          <XR>
            <color attach="background" args={[FormantColors.flagship]} />
            <MapControls enableDamping={false} />
            <PerspectiveCamera makeDefault position={[0, 0, 300]} up={[0, 0, 1]} far={5000} />
            <CameraTargetListener targetId={cameraTargetId} />
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
