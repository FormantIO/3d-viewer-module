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
import { MathUtils, Scene, Vector3 } from "three";
import ZoomControls from "../../components/ZoomControls";
import { LayerType } from "./LayerTypes";

const query = new URLSearchParams(window.location.search);
const shouldUseVR = query.get("vr") === "true";
const fancy = query.get("fancy") === "true";
const DEFAULT_CAMERA_POSITION = new Vector3(0, 0, 40);

type IUniverseProps = {
  children?: React.ReactNode;
  configHash: string;
};

let zooming = false;
let autoCameraMoving = false;
export function Universe(props: IUniverseProps) {
  const [scene, setScene] = React.useState<Scene | null>(null!);
  const [hasCentered, setHasCentered] = React.useState(false);
  const mapControlsRef = React.useRef<any>(null!);
  const vr = shouldUseVR;
  const {
    layers,
    register,
    toggleVisibility,
    cameraTargetId,
    setCameraTargetId,
    reset,
    isEditing,
    toggleEditMode,
  } = useUI();

  useEffect(() => {
    reset();
  }, [props.configHash]);

  const lookAtTargetId = React.useCallback(
    (targetId: string) => {
      const m = mapControlsRef.current;
      if (m && scene) {
        const target = scene.getObjectByName(targetId);
        if (target) {
          autoCameraMoving = true;
          const targetPosition = target.getWorldPosition(new Vector3());
          const currentTarget = m.target.clone();
          const currentPosition = m.object.position.clone();

          const desiredTarget = new Vector3(
            targetPosition.x,
            targetPosition.y,
            targetPosition.z
          );
          const desiredPosition = new Vector3(
            targetPosition.x,
            targetPosition.y,
            DEFAULT_CAMERA_POSITION.z
          );

          let lerpTarget = currentTarget.clone();
          let lerpPosition = currentPosition.clone();

          const animationFrame = () => {
            lerpTarget = currentTarget.lerp(desiredTarget, 0.07);
            lerpPosition = currentPosition.lerp(desiredPosition, 0.07);
            m.target.copy(lerpTarget);
            m.object.position.copy(lerpPosition);
            m.update();
            if (!autoCameraMoving) {
              return;
            }

            if (
              m.target.distanceToSquared(desiredTarget) > 0.1 ||
              m.object.position.distanceToSquared(desiredPosition) > 0.1
            ) {
              requestAnimationFrame(animationFrame);
            } else {
              autoCameraMoving = false;
            }
          };
          requestAnimationFrame(animationFrame);
        }
      }
    },
    [scene, mapControlsRef]
  );

  const recenter = React.useCallback(() => {
    const m = mapControlsRef.current;

    if (m) {
      autoCameraMoving = true;
      const target = m.target;
      const position = m.object.position;
      const defaultTarget = new Vector3(0, 0, 0);
      const defaultPosition = new Vector3(
        DEFAULT_CAMERA_POSITION.x,
        DEFAULT_CAMERA_POSITION.y,
        300
      );
      let lerpTarget = target.clone();
      let lerpPosition = position.clone();
      let lerpRotation = m.getAzimuthalAngle();
      m.object.useEuler = true;
      m.object.rotation.set(0, 0, 0);
      m.object.z = 0;

      const animationFrame = () => {
        lerpTarget = target.lerp(defaultTarget, 0.05);
        lerpPosition = position.lerp(defaultPosition, 0.05);
        lerpRotation = MathUtils.lerp(lerpRotation, 0, 0.05);

        target.copy(lerpTarget);
        position.copy(lerpPosition);
        m.setAzimuthalAngle(lerpRotation);
        m.update();
        if (!autoCameraMoving) {
          return;
        }

        if (
          Math.abs(target.distanceTo(defaultTarget)) > 5 ||
          Math.abs(position.distanceTo(defaultPosition)) > 5 ||
          m.getAzimuthalAngle() > 0.1
        ) {
          requestAnimationFrame(animationFrame);
        } else {
          autoCameraMoving = false;
        }
      };
      requestAnimationFrame(animationFrame);
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
        dampening = 1 - (x / distanceToTarget) * 3;
      }
      if (distanceToTarget < 10 && x > 0) {
        return;
      }
      m.object.position.copy(
        position.clone().add(direction.multiplyScalar(x * dampening))
      );
      m.update();
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

  useEffect(() => {
    layers.forEach((l) => {
      const sceneObj = scene?.getObjectByName(l.id);
      if (sceneObj) {
        sceneObj.visible = l.visible;
      }
    });
    if (!hasCentered) {
      const deviceMarker = layers.find((l) => l.type === LayerType.TRACKABLE);
      if (deviceMarker) {
        setTimeout(() => {
          lookAtTargetId(deviceMarker.id);
        }, 4000);
        setHasCentered(true);
      }
    }
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
          reset,
          isEditing,
          toggleEditMode,
        }}
      >
        {vr && <VRButton />}
        <Canvas
          onCreated={(state) => {
            setScene(state.scene);
          }}
          onMouseDownCapture={() => {
            autoCameraMoving = false;
          }}
        >
          <XR>
            <color attach="background" args={[FormantColors.flagship]} />
            <MapControls
              enableDamping={false}
              ref={mapControlsRef}
              minDistance={1}
              maxPolarAngle={Math.PI / 2 - 0.1}
            />
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
          isEditing={isEditing}
          toggleEditMode={toggleEditMode}
        />
      </UIDataContext.Provider>
    </>
  );
}
