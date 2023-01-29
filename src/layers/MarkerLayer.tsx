import { createRoot } from "react-dom/client";
import React, { useRef, useState } from "react";
import { Canvas, ThreeElements, useFrame } from "@react-three/fiber";
import { IUniverseData } from "@formant/universe-core";
import { TransformLayer } from "./TransformLayer";
import { IUniverseLayerProps } from "./types";

interface IMarkerLayerProps extends IUniverseLayerProps {}

export function MarkerLayer(props: IMarkerLayerProps) {
  const { children } = props;
  return (
    <TransformLayer positioning={props.positioning}>{children}</TransformLayer>
  );
}
