import { useEffect, useRef } from "react";
import { IUniverseLayerProps } from "../types";
import { DataVisualizationLayer } from "../DataVisualizationLayer";
import { IPose, UniverseTelemetrySource } from "@formant/universe-core";
import { Euler, Mesh, Quaternion, Vector3 } from "three";
import { FormantColors } from "../utils/FormantColors";
import { ThreeEvent } from "@react-three/fiber";
import { Waypoint } from "./Waypoint";
import { useControlsContext } from "../common/ControlsContext";
import { PathType } from "../types";
import { WaypointPath } from "./WaypointPath";

interface IWaypointsProps extends IUniverseLayerProps {
  dataSource?: UniverseTelemetrySource;
  pathType?: PathType;
  pathWidth?: number;
  commandName?: string;
}

export const WaypointsLayer = (props: IWaypointsProps) => {
  const {
    store,
    updateState,
    waypoints,
    setWaypoints,
    state: { isWaypointEditing, hasWaypointsPath },
  } = useControlsContext();
  const {
    pathWidth = 2.5,
    pathType = PathType.DYNAMIC,
    commandName = "send_mission_waypoints",
  } = props;

  // Initialization
  useEffect(() => {
    updateState({ commandName, hasPath: false });
  }, [commandName, updateState]);

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
        position-z={-0.1 - pathWidth / 10}
      >
        <planeGeometry args={[1000, 1000]} />
        <meshStandardMaterial
          color={FormantColors.green}
          transparent={true}
          opacity={0.6}
        />
      </mesh>

      <group name="waypoints" visible={hasWaypointsPath}>
        {waypoints.map((pose: IPose, idx: number) => (
          <Waypoint
            key={idx}
            pointIndex={idx}
            pose={pose}
            onPose={(p: IPose) => poseChangeHandler(p, idx)}
            pathType={pathType}
            pathWidth={pathWidth}
          />
        ))}
        <WaypointPath pathType={pathType} pathWidth={pathWidth} />
      </group>
    </DataVisualizationLayer>
  );
};
