import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { IUniverseLayerProps } from "../types";
import { DataVisualizationLayer } from "../DataVisualizationLayer";
import { IPose, UniverseTelemetrySource } from "@formant/universe-core";
import { Mesh } from "three";
import { FormantColors } from "../utils/FormantColors";
import { ThreeEvent } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import { Waypoint } from "./Waypoint";
import { useControlsContext } from "../common/ControlsContext";

interface IWaypointsProps extends IUniverseLayerProps {
  dataSource?: UniverseTelemetrySource;
}

export const WaypointsLayer = (props: IWaypointsProps) => {
  const [points, setPoints] = useState<IPose[]>([]);
  const { store, updateState } = useControlsContext();

  useEffect(() => {
    updateState({ isWaypointVisible: true }); // Show UI
    return () => {
      store.waypoints = [];
    };
  }, [store, updateState]);

  const mouseDownHandler = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      if (!e.shiftKey) {
        updateState({ selectedWaypoint: null }); // Remove gizmo
        return;
      }
      let p = e.point;
      setPoints([
        ...points,
        {
          translation: {
            x: p.x,
            y: p.y,
            z: p.z + 0.125,
          },
          rotation: {
            x: 0,
            y: 0,
            z: 0,
            w: 1,
          },
        },
      ]);
    },
    [points, setPoints]
  );

  const poseChangeHandler = (updatedPose: IPose, index: number) => {
    const newPoints = [...points];
    newPoints[index] = updatedPose;
    setPoints(newPoints);
    store.waypoints[index].pose = updatedPose;
  };

  const plane = useRef<Mesh>(null!);

  return (
    <DataVisualizationLayer {...props} iconUrl="icons/3d_object.svg">
      <mesh name="plane" onPointerDown={mouseDownHandler} ref={plane}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color={FormantColors.green} />
      </mesh>

      <group name="waypoints">
        {points.map((pose: IPose, idx: number) => (
          <Waypoint
            key={idx}
            pointIndex={idx}
            pose={pose}
            onPose={(p: IPose) => poseChangeHandler(p, idx)}
          />
        ))}

        {points.length > 0 && (
          <Line
            points={points.map(({ translation: { x, y, z } }) => [x, y, z])}
            lineWidth={1}
            color="white"
            forceSinglePass={undefined}
          />
        )}
      </group>
    </DataVisualizationLayer>
  );
};