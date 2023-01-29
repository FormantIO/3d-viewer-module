import { Cylinder, Line } from "@react-three/drei";
import React, { useContext, useRef, useState } from "react";
import { Vector3 } from "three";
import { FormantColors } from "../FormantColors";
import { UniverseTelemetrySource } from "../model/DataSource";
import { UniverseData } from "../UniverseData";
import { TransformLayer } from "./TransformLayer";
import { IUniverseLayerProps } from "./types";

interface IMapLayer extends IUniverseLayerProps {
  dataSource: UniverseTelemetrySource;
}

export function MapLayer(props: IMapLayer) {
  const [points, setPoints] = useState<Vector3[]>([]);
  const { children } = props;
  const _universeData = useContext(UniverseData);
  return (
    <TransformLayer positioning={props.positioning}>
      <mesh
        onPointerDown={(e) => {
          setPoints([...points, e.point]);
        }}
      >
        <boxGeometry args={[3, 0.1, 3]} />
        <meshStandardMaterial color={FormantColors.module} />
      </mesh>
      {points.map((p: Vector3, i) => {
        const v: [number, number, number] = [p.x, p.z, -p.y];
        let lastv: [number, number, number] | undefined;
        if (i > 0) {
          lastv = [points[i - 1].x, points[i - 1].z, -points[i - 1].y];
        }
        return (
          <>
            {i > 0 && lastv !== undefined && (
              <Line
                points={[v, lastv]}
                color={FormantColors.silver}
                lineWidth={1}
              />
            )}
            <Cylinder position={v} scale={0.1} key={"c_" + i}>
              <meshStandardMaterial color={FormantColors.silver} />
            </Cylinder>
          </>
        );
      })}
      {children}
    </TransformLayer>
  );
}
