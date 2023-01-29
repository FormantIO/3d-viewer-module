import React, { useRef, useState } from "react";
import { TransformLayer } from "./TransformLayer";
import { IUniverseLayerProps } from "./types";

interface IMapLayer extends IUniverseLayerProps {}

export function MapLayer(props: IMapLayer) {
  const { children } = props;
  return (
    <TransformLayer positioning={props.positioning}>
      <mesh>
        <boxGeometry args={[3, 0.1, 3]} />
        <meshStandardMaterial color={"orange"} />
      </mesh>
      {children}
    </TransformLayer>
  );
}
