import React from "react";
import { IVector3 } from "@formant/universe-core";
import { useFrame } from "@react-three/fiber";
import { Line2 } from "three-stdlib";
import { Line } from "@react-three/drei";
import { PathType } from "../types";
import { FormantColors } from "../utils/FormantColors";
import { ThreeEvent } from "@react-three/fiber";
import { useControlsContext } from "../common/ControlsContext";
import { Euler, Quaternion, Vector3 } from "three";

interface Props {
  pathType?: PathType;
  pathWidth?: number;
}

export const WaypointPath: React.FC<Props> = ({ pathType, pathWidth }) => {
  const {
    store,
    updateState,
    waypoints,
    setWaypoints,
    state: { isWaypointEditing },
  } = useControlsContext();

  const dashedLine = React.useRef<Line2>(null!);

  // Add middle waypoint
  const addMiddleWaypoint = (e: ThreeEvent<PointerEvent>) => {
    if (!isWaypointEditing) return;

    e.stopPropagation();
    if (!e.shiftKey) {
      return;
    }

    let p = e.point;
    const index = true ? e.faceIndex! : parseInt(e.eventObject.name);
    const v = (e: IVector3) => new Vector3(e.x, e.y, 0);
    const prev = v(waypoints[index].translation);
    const next = v(waypoints[index + 1].translation);

    // Get translation
    const dir1 = new Vector3().subVectors(next, prev);
    const dir2 = new Vector3().subVectors(p, prev);
    const projection = dir2.dot(dir1) / dir1.lengthSq();
    const positionToAdd = new Vector3().addVectors(
      prev,
      dir1.clone().multiplyScalar(projection)
    );

    // Get snap angle
    const vector = new Vector3(next.x - prev.x, next.y - prev.y, 0);
    let angle = vector.angleTo(new Vector3(1, 0, 0));
    angle *= Math.sign(next.y - prev.y);
    const euler = new Euler(0, 0, angle);
    const { x, y, z, w } = new Quaternion().setFromEuler(euler);

    const pose = {
      translation: {
        x: positionToAdd.x,
        y: positionToAdd.y,
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

  useFrame(({ camera, size: { height } }) => {
    if (!dashedLine.current) return;
    const factor = height > 600 ? 25 : 25 * (height / 600);
    let scale =
      dashedLine.current.position.distanceTo(camera.position) / factor;
    dashedLine.current.material.dashScale = 1.5 / scale;
  });

  if (waypoints.length === 0) return <></>;
  return (
    <>
      <Line
        points={waypoints.map(({ translation: { x, y, z } }) => [
          x,
          y,
          z + 0.005,
        ])}
        lineWidth={pathType === PathType.DYNAMIC ? 18 : pathWidth! / 10}
        depthTest={false}
        worldUnits={pathType === PathType.STATIC}
        renderOrder={1}
        color={FormantColors.blue}
        onPointerDown={addMiddleWaypoint}
        visible={false}
      />
      <Line
        ref={dashedLine}
        points={waypoints.map(({ translation: { x, y, z } }) => [
          x,
          y,
          z - 0.01,
        ])}
        lineWidth={pathType === PathType.DYNAMIC ? 18 : pathWidth}
        depthTest={false}
        worldUnits={pathType === PathType.STATIC}
        renderOrder={1}
        color={"white"}
        dashed={true}
        dashScale={4}
      />
    </>
  );
};
