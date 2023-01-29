import React, { useContext, useRef, useState } from "react";
import { UniverseTelemetrySource } from "../model/DataSource";
import { UniverseData } from "../UniverseData";
import { TransformLayer } from "./TransformLayer";
import { IUniverseLayerProps } from "./types";

interface IMapLayer extends IUniverseLayerProps {
  dataSource: UniverseTelemetrySource;
}

export function MapLayer(props: IMapLayer) {
  const { children } = props;
  const _universeData = useContext(UniverseData);
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
