import { ThreeElements, useFrame } from "@react-three/fiber";
import React, { useContext, useEffect, useRef, useState } from "react";
import { Ring } from "@react-three/drei";
import { range } from "../common/range";
import { Axis } from "../components/Axis";
import { FormantColors } from "../FormantColors";
import { TransformLayer } from "./TransformLayer";
import { IUniverseLayerProps } from "./types";
import { UIDataContext } from "../UIDataContext";

interface IGroundLayer extends IUniverseLayerProps { }

function SilverCircle({ width }: { width: number }) {
  return (
    <Ring args={[width - 0.005, width, 60]}>
      <meshStandardMaterial color={FormantColors.steel03} />
    </Ring>
  );
}

export function GroundLayer(props: IGroundLayer) {
  const { children, name } = props;
  const { register, layers } = React.useContext(UIDataContext);
  const id = 'laksjdasl';

  useEffect(() => {
    register(name || 'Ground', id);
  }, [])

  const thisLayer = layers.find(layer => layer.id === id);


  return (
    <TransformLayer {...props} visible={thisLayer?.visible}>
      <Axis />
      {range(0, 100).map((i) => (
        <SilverCircle key={i} width={i} />
      ))}
      {children}
    </TransformLayer>
  );
}
