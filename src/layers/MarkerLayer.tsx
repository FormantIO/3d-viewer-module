import { createRoot } from "react-dom/client";
import React, { useContext, useRef, useState } from "react";
import { Canvas, ThreeElements, useFrame } from "@react-three/fiber";
import { IUniverseData } from "@formant/universe-core";
import { TransformLayer } from "./TransformLayer";
import { IUniverseLayerProps } from "./types";
import { UniverseData } from "../UniverseData";

interface IMarkerLayerProps extends IUniverseLayerProps {}

export function MarkerLayer(props: IMarkerLayerProps) {
  const { children } = props;
  const _universeData = useContext(UniverseData);
  return (
    <TransformLayer positioning={props.positioning}>
      <mesh>
        <boxGeometry args={[0.2, 0.2, 0.2]} />
        <meshStandardMaterial color={"red"} />
      </mesh>
      {children}
    </TransformLayer>
  );
}
