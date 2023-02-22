import { ThreeElements, useFrame } from "@react-three/fiber";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Ring } from "@react-three/drei";
import { range } from "../common/range";
import { Axis } from "./objects/Axis";
import { FormantColors } from "./utils/FormantColors";
import { DataVisualizationLayer } from "./DataVisualizationLayer";
import { IUniverseLayerProps } from "./types";
import { AxisLabels } from "./objects/AxisLabels";
interface IGroundLayer extends IUniverseLayerProps {
  flatAxis?: boolean;
}

function SilverCircle({ width }: { width: number }) {
  return (
    <Ring args={[width - 0.005, width, 60]}>
      <meshStandardMaterial color={FormantColors.steel03} />
    </Ring>
  );
}

export function GroundLayer(props: IGroundLayer) {
  const { children, flatAxis } = props;

  const axisLayers = useMemo(() => {
    return new AxisLabels(flatAxis || false);
  }, []);

  return (
    <DataVisualizationLayer {...props} iconUrl="icons/3d_object.svg">
      <Axis />
      <primitive object={axisLayers} />
      {range(0, 100).map((i) => (
        <SilverCircle key={i} width={i} />
      ))}
      {children}
    </DataVisualizationLayer>
  );
}
