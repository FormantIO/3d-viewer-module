import React, { useEffect, useRef } from "react";
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
  const {
    store,
    updateState,
    waypoints,
    setWaypoints,
    state: { isWaypointEditing },
  } = useControlsContext();

  useEffect(() => {
    updateState({ isWaypointVisible: true }); // Show UI
    return () => {
      store.waypoints = [];
    };
  }, [store, updateState]);

  // Add new waypoint
  const mouseDownHandler = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (!isWaypointEditing || !e.shiftKey) return;

    let p = e.point;
    const pose = {
      translation: {
        x: p.x,
        y: p.y,
        z: 0,
      },
      rotation:
        waypoints.length > 0
          ? waypoints[waypoints.length - 1].rotation
          : {
              x: 0,
              y: 0,
              z: 0,
              w: 1,
            },
    };
    setWaypoints([...waypoints, pose]);
    updateState({ selectedWaypoint: waypoints.length });
    store.waypoints.push({
      ...(waypoints.length > 0 ? store.waypoints[waypoints.length - 1] : {}),
      pointIndex: waypoints.length,
      pose,
    });
  };

  const poseChangeHandler = (updatedPose: IPose, index: number) => {
    const newPoints = [...waypoints];
    newPoints[index] = updatedPose;
    setWaypoints(newPoints);
    store.waypoints[index].pose = updatedPose;
  };

  const plane = useRef<Mesh>(null!);

  return (
    <DataVisualizationLayer {...props} iconUrl="icons/3d_object.svg">
      <mesh
        name="plane"
        onPointerDown={mouseDownHandler}
        ref={plane}
        visible={false}
        position-z={-0.1}
      >
        <planeGeometry args={[1000, 1000]} />
        <meshStandardMaterial
          color={FormantColors.green}
          transparent={true}
          opacity={0.6}
        />
      </mesh>

      <group name="waypoints">
        {waypoints.map((pose: IPose, idx: number) => (
          <Waypoint
            key={idx}
            pointIndex={idx}
            pose={pose}
            onPose={(p: IPose) => poseChangeHandler(p, idx)}
          />
        ))}

        {waypoints.length > 0 && (
          <Line
            points={waypoints.map(({ translation: { x, y, z } }) => [x, y, z])}
            lineWidth={12}
            depthTest={false}
            renderOrder={1}
            color={FormantColors.blue}
            // Add a middle waypoint
            onPointerDown={(e) => {
              if (!isWaypointEditing) return;

              e.stopPropagation();
              if (!e.shiftKey) {
                return;
              }
              let p = e.point;
              const pose = {
                translation: {
                  x: p.x,
                  y: p.y,
                  z: 0,
                },
                rotation: waypoints[e.faceIndex!].rotation,
              };
              setWaypoints((prev) => {
                prev.splice(e.faceIndex! + 1, 0, pose);
                return [...prev];
              });
              updateState({ selectedWaypoint: e.faceIndex! + 1 });
              store.waypoints.splice(e.faceIndex! + 1, 0, {
                ...store.waypoints[e.faceIndex!],
                pointIndex: e.faceIndex! + 1,
                pose,
              });
            }}
          />
        )}
      </group>
    </DataVisualizationLayer>
  );
};
