import { ThreeElements, useFrame } from "@react-three/fiber";
import React, { useContext, useEffect, useRef, useState } from "react";
import { Ring } from "@react-three/drei";
import { range } from "../common/range";
import { Axis } from "./objects/Axis";
import { FormantColors } from "./utils/FormantColors";
import { DataVisualizationLayer } from "./DataVisualizationLayer";
import { IUniverseLayerProps } from "./types";
import { UIDataContext } from "./common/UIDataContext";
import * as uuid from "uuid";

interface IGroundLayer extends IUniverseLayerProps {}

function SilverCircle({ width }: { width: number }) {
  return (
    <Ring args={[width - 0.005, width, 60]}>
      <meshStandardMaterial color={FormantColors.steel03} />
    </Ring>
  );
}

export function GroundLayer(props: IGroundLayer) {
  const { children } = props;

  return (
    <DataVisualizationLayer {...props}>
      <Axis />
      {range(0, 100).map((i) => (
        <SilverCircle key={i} width={i} />
      ))}
      {children}
    </DataVisualizationLayer>
  );
}
