import React, { useContext, useRef, useState } from "react";
import { range } from "../common/range";
import { UniverseData } from "../UniverseData";
import { TransformLayer } from "./TransformLayer";
import { IUniverseLayerProps } from "./types";

interface IGeometryLayer extends IUniverseLayerProps {}

export function GeometryLayer(props: IGeometryLayer) {
  const { children } = props;
  const universeData = useContext(UniverseData);
  return (
    <TransformLayer positioning={props.positioning}>
      {range(0, 10).map((x) => (
        <mesh position={[x, 1, 1]}>
          <boxGeometry args={[0.1, 1, 0.1]} />
          <meshStandardMaterial color={"green"} />
        </mesh>
      ))}
      {children}
    </TransformLayer>
  );
}
