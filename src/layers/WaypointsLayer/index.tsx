import React, { useEffect, useRef } from "react";
import { IUniverseLayerProps } from "../types";
import { DataVisualizationLayer } from "../DataVisualizationLayer";
import { IPose, UniverseTelemetrySource } from "@formant/universe-core";
import { Euler, Mesh, Quaternion, Vector3 } from "three";
import { FormantColors } from "../utils/FormantColors";
import { ThreeEvent } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import { Waypoint } from "./Waypoint";
import { useControlsContext } from "../common/ControlsContext";
import { PathType } from "../../components/WaypointPanel/types";
import { StaticPath } from "./StaticPath";

interface IWaypointsProps extends IUniverseLayerProps {
  dataSource?: UniverseTelemetrySource;
  pathType?: PathType;
  pathWidth?: string;
  commandName?: string;
}

export const WaypointsLayer = (props: IWaypointsProps) => {
  const {
    store,
    updateState,
    waypoints,
    setWaypoints,
    state: { isWaypointEditing },
  } = useControlsContext();
  const { pathWidth = "5", pathType = PathType.STATIC, commandName } = props;
  useEffect(() => {
    updateState({ isWaypointVisible: true, commandName }); // Show UI
    return () => {
      store.waypoints = [];
    };
  }, [store, commandName, updateState]);

  // Add new waypoint
  const addNewWaypoint = (e: ThreeEvent<PointerEvent>) => {
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

    // Snap orientation of previous waypoint
    if (waypoints.length > 0) {
      // pose.rotation
      const prev = waypoints[waypoints.length - 1].translation;
      const next = pose.translation;
      const vector = new Vector3(next.x - prev.x, next.y - prev.y, 0);
      let angle = vector.angleTo(new Vector3(1, 0, 0));
      angle *= Math.sign(next.y - prev.y);
      const euler = new Euler(0, 0, angle);
      const { x, y, z, w } = new Quaternion().setFromEuler(euler);
      const prevWaypoint = { translation: prev, rotation: { x, y, z, w } };
      setWaypoints([
        ...waypoints.slice(0, waypoints.length - 1),
        prevWaypoint,
        pose,
      ]);

      store.waypoints[waypoints.length - 1].pose = prevWaypoint;
      store.waypoints[waypoints.length] = {
        ...store.waypoints[waypoints.length - 1],
        pointIndex: waypoints.length,
        pose,
      };
    } else {
      setWaypoints([pose]);
      store.waypoints.push({
        pointIndex: waypoints.length,
        pose,
      });
    }

    updateState({ selectedWaypoint: waypoints.length });
  };

  // Add middle waypoint
  const addMiddleWaypoint = (e: ThreeEvent<PointerEvent>, type: PathType) => {
    if (!isWaypointEditing) return;

    e.stopPropagation();
    if (!e.shiftKey) {
      return;
    }
    let p = e.point;
    const index =
      type === PathType.DYNAMIC ? e.faceIndex! : parseInt(e.eventObject.name);
    const prev = waypoints[index].translation;
    const next = waypoints[index + 1].translation;
    const vector = new Vector3(next.x - prev.x, next.y - prev.y, 0);
    let angle = vector.angleTo(new Vector3(1, 0, 0));
    angle *= Math.sign(next.y - prev.y);
    const euler = new Euler(0, 0, angle);
    const { x, y, z, w } = new Quaternion().setFromEuler(euler);

    const pose = {
      translation: {
        x: p.x,
        y: (p.x - prev.x) * Math.tan(angle) + prev.y,
        z: 0,
      },
      rotation: { x, y, z, w },
    };

    setWaypoints((prev) => {
      prev.splice(index + 1, 0, pose);
      return [...prev];
    });
    updateState({ selectedWaypoint: index + 1 });
    store.waypoints.splice(index + 1, 0, {
      ...store.waypoints[index],
      pointIndex: index + 1,
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
        onPointerDown={addNewWaypoint}
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
            pathType={pathType}
          />
        ))}

        {waypoints.length > 0 && (
          <>
            {pathType === PathType.DYNAMIC ? (
              <Line
                points={waypoints.map(({ translation: { x, y, z } }) => [
                  x,
                  y,
                  z,
                ])}
                lineWidth={12}
                depthTest={false}
                renderOrder={1}
                color={FormantColors.blue}
                onPointerDown={(e) => addMiddleWaypoint(e, PathType.DYNAMIC)}
              />
            ) : (
              <StaticPath
                points={waypoints}
                pathWidth={parseInt(pathWidth)}
                color={FormantColors.blue}
                onPointerDown={(e) => addMiddleWaypoint(e, PathType.STATIC)}
              />
            )}
          </>
        )}
      </group>
    </DataVisualizationLayer>
  );
};
