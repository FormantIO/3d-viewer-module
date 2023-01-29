import React, { useContext, useEffect, useRef } from "react";
import { IUniverseLayerProps } from "./types";
import { UniverseData } from "../UniverseData";
import { PositioningBuilder } from "../model/PositioningBuilder";

interface ITransformLayerProps extends IUniverseLayerProps {}

export function TransformLayer(props: ITransformLayerProps) {
  const universeData = useContext(UniverseData);
  const { children, positioning } = props;
  const groupRef = useRef<THREE.Group>(null!);
  useEffect(() => {
    const p = positioning || PositioningBuilder.fixed(0, 0, 0);
    if (groupRef.current) {
      const g = groupRef.current;
      if (p.type === "manual") {
        const { x, y, z } = p;
        g.position.set(x, y, z);
      }
    }
  }, [groupRef, positioning]);
  return <group ref={groupRef}>{children}</group>;
}
