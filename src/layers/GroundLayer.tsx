import { Circle, Cylinder, Ring, Tube } from "@react-three/drei";
import React, { useContext, useRef, useState } from "react";
import { range } from "../common/range";
import { Axis } from "../components/Axis";
import { FormantColors } from "../FormantColors";
import { UniverseTelemetrySource } from "../model/DataSource";
import { UniverseDataContext } from "../UniverseDataContext";
import { TransformLayer } from "./TransformLayer";
import { IUniverseLayerProps } from "./types";

interface IGroundLayer extends IUniverseLayerProps {}

function SilverCircle({ width }: { width: number }) {
  return (
    <Ring rotation={[-Math.PI / 2, 0, 0]} args={[width - 0.005, width, 60]}>
      <meshStandardMaterial color={FormantColors.steel03} />
    </Ring>
  );
}

export function GroundLayer(props: IGroundLayer) {
  const { children } = props;
  const _universeData = useContext(UniverseDataContext);
  return (
    <TransformLayer positioning={props.positioning}>
      <Axis />
      {range(0, 100).map((i) => (
        <SilverCircle key={i} width={i} />
      ))}
      {children}
    </TransformLayer>
  );
}
