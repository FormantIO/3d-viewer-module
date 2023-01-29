import React, { useContext, useRef, useState } from "react";
import { range } from "../common/range";
import { FormantColors } from "../FormantColors";
import { UniverseTelemetrySource } from "../model/DataSource";
import { UniverseDataContext } from "../UniverseDataContext";
import { TransformLayer } from "./TransformLayer";
import { IUniverseLayerProps } from "./types";

interface IGeometryLayer extends IUniverseLayerProps {
  dataSource: UniverseTelemetrySource;
}

export function GeometryLayer(props: IGeometryLayer) {
  const { children } = props;
  const _universeData = useContext(UniverseDataContext);
  return (
    <TransformLayer positioning={props.positioning}>
      {range(0, 10).map((x, i) => (
        <mesh key={i} position={[x, 1, 1]}>
          <boxGeometry args={[0.1, 1, 0.1]} />
          <meshStandardMaterial color={FormantColors.green} />
        </mesh>
      ))}
      {children}
    </TransformLayer>
  );
}
