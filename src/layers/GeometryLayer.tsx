import React, { useRef, useState } from "react";
import { TransformLayer } from "./TransformLayer";
import { IUniverseLayerProps } from "./types";

interface IGeometryLayer extends IUniverseLayerProps {}

export function GeometryLayer(props: IGeometryLayer) {
  const { children } = props;
  return (
    <TransformLayer positioning={props.positioning}>{children}</TransformLayer>
  );
}
