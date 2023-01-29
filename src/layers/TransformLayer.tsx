import { createRoot } from "react-dom/client";
import React, { useContext, useRef, useState } from "react";
import { Canvas, ThreeElements, useFrame } from "@react-three/fiber";
import { IUniverseLayerProps } from "./types";
import { UniverseData } from "../UniverseData";

interface ITransformLayerProps extends IUniverseLayerProps {}

export function TransformLayer(props: ITransformLayerProps) {
  const _universeData = useContext(UniverseData);
  const { children } = props;
  return <group>{children}</group>;
}
