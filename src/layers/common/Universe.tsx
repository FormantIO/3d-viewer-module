import { Canvas, useThree } from "@react-three/fiber";
import { CameraControls, PerspectiveCamera } from "@react-three/drei";
import React, { ReactNode, useEffect } from "react";
import { FormantColors } from "../utils/FormantColors";
import {
  EffectComposer,
  Bloom,
  Noise,
  Vignette,
} from "@react-three/postprocessing";
import { VRButton, XR, Controllers, Hands } from "@react-three/xr";
import { BlendFunction } from "postprocessing";
import Sidebar from "../../components/Sidebar";
import { UIDataContext, useUI } from "./UIDataContext";
import { Scene } from "three";
import ZoomControls from "../../components/ZoomControls";
import { LayerType } from "./LayerTypes";
import { ControlsContext, useControlsContextStates } from "./ControlsContext";
import { Bounds } from "./CustomBounds";
import { MissionPlanning } from "../../components/MissionPlanning";
import { PointSizeSlider } from "../../components/PcdSizeSlider";
import styled from "styled-components";
import { Viewer3DConfiguration } from "../../config";
import { Timeout } from "../../common/Timeout";

const query = new URLSearchParams(window.location.search);
const shouldUseVR = query.get("vr") === "true";
const fancy = query.get("fancy") === "true";

type IUniverseProps = {
  children?: React.ReactNode;
  configHash: string;
  config: Viewer3DConfiguration;
};

const WaitForControls = ({ children }: { children: ReactNode }) => {
  const { controls } = useThree();
  if (controls) {
    return <>{children}</>;
  }
  return null;
};

interface ISceneContainer {
  sidebarOpen: boolean;
}

const SceneContainer = styled.div<ISceneContainer>`
  position: absolute;
  top: 0;
  left: ${({ sidebarOpen }) => (sidebarOpen ? "252px" : "0px")};
  height: 100%;
  width: ${({ sidebarOpen }) => (sidebarOpen ? "calc(100% - 252px)" : "100%")};
  overflow: hidden;
  transition: left 0.2s ease;
  & canvas {
    transition: width 0.05s linear;
    width: 100%;
  }
`;

export function Universe(props: IUniverseProps) {
  const [scene, setScene] = React.useState<Scene | null>(null!);
  const [sidebarOpen, setSidebarOpen] = React.useState<boolean>(false);
  const mapControlsRef = React.useRef<CameraControls>(null!);
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

  const controlsStates = useControlsContextStates();
  const {
    state: { commandName, isWaypointPanelVisible },
  } = controlsStates;

  useEffect(() => {
    reset();
  }, [props.configHash]);

  const lookAtTargetId = (targetId: string, isDevice = false) => {
    scene?.dispatchEvent({
      type: "lookAtTargetId",
      message: targetId,
      isDevice,
    });
  };

  const centerOnDevice = React.useCallback(() => {
    const deviceMarker = layers.find((l) => l.type === LayerType.TRACKABLE);
    if (deviceMarker) {
      lookAtTargetId(deviceMarker.id, true);
    } else {
      recenter();
    }
  }, [layers, lookAtTargetId]);

  const recenter = () => {
    scene?.dispatchEvent({ type: "recenter" });
  };

  const zoomCamera = (delta: number) => {
    const m = mapControlsRef.current;
    if (m) {
      m.dolly(delta, true);
    }
  };

  let intervalId: Timeout;
  const zoomIn = () => {
    let zoomSpeed = 0.5;
    intervalId = setInterval(() => {
      zoomCamera(zoomSpeed);
      if (mapControlsRef.current?.distance <= 1) {
        clearInterval(intervalId);
      }
    }, 20);
  };

  const zoomOut = () => {
    let zoomSpeed = 0.5;
    intervalId = setInterval(() => {
      zoomCamera(-zoomSpeed);

      if (
        mapControlsRef.current?.distance >=
        mapControlsRef.current?.maxDistance - 1
      ) {
        clearInterval(intervalId);
      }
    }, 20);
  };

  const stopZoom = () => {
    clearInterval(intervalId);
  };

  useEffect(() => {
    layers.forEach((l) => {
      const sceneObj = scene?.getObjectByName(l.id);
      if (sceneObj) {
        sceneObj.visible = l.visible;
      }
    });
  }, [layers, scene]);

  const sidebarOpenCallback = () => {
    setSidebarOpen(!sidebarOpen);
  };

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
        {!isWaypointPanelVisible && (
          <Sidebar
            lookAtTargetId={lookAtTargetId}
            toggleSidebarCallback={sidebarOpenCallback}
          />
        )}
        <SceneContainer sidebarOpen={sidebarOpen}>
          {vr && <VRButton />}
          <Canvas
            onCreated={(state) => {
              setScene(state.scene);
            }}
            dpr={1}
            flat
          >
            <XR>
              <color attach="background" args={[FormantColors.steel01]} />
              <ControlsContext.Provider value={controlsStates}>
                <PerspectiveCamera
                  makeDefault
                  position={[0, 0, 10]}
                  up={[0, 0, 1]}
                  far={5000}
                  near={0.1}
                />
                <CameraControls
                  makeDefault
                  ref={mapControlsRef}
                  maxDistance={2000}
                  maxPolarAngle={Math.PI / 2 - 0.1}
                  attach={"controls"}
                  verticalDragToForward={true}
                  //dollyToCursor={true}
                  infinityDolly={false}
                  minDistance={2}
                  mouseButtons={{
                    left: 2, // truck
                    right: 1, // rotate
                    middle: 2, // truck
                    wheel: 8, // dolly
                  }}
                />

                <WaitForControls>
                  <Bounds observe margin={1.5} damping={6}>
                    <group>{props.children}</group>
                  </Bounds>
                </WaitForControls>
                {fancy && (
                  <EffectComposer>
                    <Bloom
                      mipmapBlur
                      intensity={1.0}
                      luminanceThreshold={0.5}
                    />
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
              </ControlsContext.Provider>
            </XR>
          </Canvas>
        </SceneContainer>
        <ZoomControls
          zoomIn={zoomIn}
          zoomOut={zoomOut}
          recenter={centerOnDevice}
          stopZoom={stopZoom}
          isEditing={isEditing}
          toggleEditMode={toggleEditMode}
        />
        <PointSizeSlider controlsStates={controlsStates} />
        {commandName && (
          <MissionPlanning
            controlsStates={controlsStates}
            config={props.config}
          />
        )}
      </UIDataContext.Provider>
    </>
  );
}
