import { createRoot } from "react-dom/client";
import React, { useRef, useState } from "react";
import { Canvas, ThreeElements, useFrame } from "@react-three/fiber";
import { IUniverseData } from "@formant/universe-core";
import { TransformLayer } from "./TransformLayer";
import { IUniverseLayerProps } from "./types";

interface IMarkerLayerProps extends IUniverseLayerProps {}

export function MarkerLayer(props: IMarkerLayerProps) {
  const { children } = props;
  // This reference gives us direct access to the THREE.Mesh object
  const ref = useRef<ThreeElements["mesh"]>(null);
  // Hold state for hovered and clicked events
  const [hovered, hover] = useState(false);
  const [clicked, click] = useState(false);
  // Subscribe this component to the render-loop, rotate the mesh every frame
  useFrame((state, delta) => {
    if (ref.current) ref.current.rotation.x += delta;
  });
  // Return the view, these are regular Threejs elements expressed in JSX
  return (
    <TransformLayer positioning={props.positioning}>
      <mesh
        ref={ref}
        scale={clicked ? 1.5 : 1}
        onClick={(event) => click(!clicked)}
        onPointerOver={(event) => hover(true)}
        onPointerOut={(event) => hover(false)}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={hovered ? "hotpink" : "orange"} />
      </mesh>
      {children}
    </TransformLayer>
  );
}
