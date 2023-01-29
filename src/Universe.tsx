import { Canvas } from "@react-three/fiber";
import React from "react";

type IUniverseProps = {
  children?: React.ReactNode;
};

export function Universe(props: IUniverseProps) {
  return <Canvas>{props.children}</Canvas>;
}
