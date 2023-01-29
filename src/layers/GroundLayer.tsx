import { Circle, Cylinder, Ring, Tube } from "@react-three/drei";
import React, { useContext, useRef, useState } from "react";
import { range } from "../common/range";
import { Axis } from "../components/Axis";
import { FormantColors } from "../FormantColors";
import { UniverseTelemetrySource } from "../model/DataSource";
import { UniverseData } from "../UniverseData";
import { TransformLayer } from "./TransformLayer";
import { IUniverseLayerProps } from "./types";

interface IGroundLayer extends IUniverseLayerProps {}

function SilverCircle({ width }: { width: number }) {
  return (
    <Ring rotation={[-Math.PI / 2, 0, 0]} args={[width - 0.005, width, 60]}>
      <meshStandardMaterial color={FormantColors.silver} />
    </Ring>
  );
}

export function GroundLayer(props: IGroundLayer) {
  const { children } = props;
  const _universeData = useContext(UniverseData);
  return (
    <TransformLayer positioning={props.positioning}>
      <Axis />
      {range(0, 100).map((i) => (
        <SilverCircle width={i} />
      ))}
      {children}
    </TransformLayer>
  );
}
