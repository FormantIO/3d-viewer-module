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
import ZoomControls from "../../components/ZoomControls";

const query = new URLSearchParams(window.location.search);
const shouldUseVR = query.get("vr") === "true";
const fancy = query.get("fancy") === "true";
const DEFAULT_CAMERA_POSITION = new Vector3(0, 0, 40);


type IUniverseProps = {
  children?: React.ReactNode;
};

let zooming = false;
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

  const recenter = React.useCallback(() => {
    const m = mapControlsRef.current;
    if (m) {
      m.target.set(0, 0, 0);
      m.object.position.set(
        DEFAULT_CAMERA_POSITION.x,
        DEFAULT_CAMERA_POSITION.y,
        300
      );
      m.update();
    }
  }, [mapControlsRef]);

  const zoomCamera = (x: number) => {
    const m = mapControlsRef.current;
    if (m) {
      const position = m.object.position;
      const target = m.target;
      const direction = target.clone().sub(position).normalize();
      const distanceToTarget = position.distanceTo(target);
      let dampening = 1;
      if (x > 0 && distanceToTarget < 40) {
        dampening = 1 - (x / distanceToTarget * 3);
      }
      if (distanceToTarget < 10 && x > 0) {
        return;
      }
      m.object.position.copy(position.clone().add(direction.multiplyScalar(x * dampening)))
      m.update()
    }
  };

  const zoomIn = () => {
    zooming = true;
    const zoom = () => {
      if (!zooming || !scene) {
        // eslint-disable-next-line no-use-before-define
        clearInterval(interval);
        return;
      }
      zoomCamera(5);
    };
    zoom();
    const interval = setInterval(zoom, 20);
  };

  const zoomOut = () => {
    zooming = true;
    const zoom = () => {
      if (!zooming || !scene) {
        // eslint-disable-next-line no-use-before-define
        clearInterval(interval);
        return;
      }
      zoomCamera(-5);
    };
    zoom();
    const interval = setInterval(zoom, 20);
  };

  const stopZoom = () => {
    zooming = false;
  };

  const vr = shouldUseVR;
  const {
    layers,
    register,
    toggleVisibility,
    cameraTargetId,
    setCameraTargetId,
  } = useUI();

  useEffect(() => {
    layers.forEach((l) => {
      const sceneObj = scene?.getObjectByName(l.id);
      if (sceneObj) {
        sceneObj.visible = l.visible
      };
    });
  }, [layers, scene]);

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
            <MapControls enableDamping={false} ref={mapControlsRef} minDistance={10} maxPolarAngle={(Math.PI / 2) - 0.1} />
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
        <ZoomControls
          zoomIn={zoomIn}
          zoomOut={zoomOut}
          recenter={recenter}
          stopZoom={stopZoom}
        />
      </UIDataContext.Provider>
    </>
  );
}
