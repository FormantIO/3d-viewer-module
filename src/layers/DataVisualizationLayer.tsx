import { useContext, useEffect, useRef, useState } from "react";
import { getDistance } from "geolib";
import { IUniverseLayerProps, PathType } from "./types";
import { UniverseDataContext } from "./common/UniverseDataContext";
import { PositioningBuilder } from "./utils/PositioningBuilder";
import { LayerContext } from "./common/LayerContext";
import {
  CloseSubscription,
  defined,
  IUniverseOdometry,
} from "@formant/data-sdk";
import { DataSourceBuilder } from "./utils/DataSourceBuilder";
import {
  Box3,
  Box3Helper,
  Euler,
  Group,
  Matrix4,
  Object3D,
  Object3DEventMap,
  Quaternion,
  Vector3,
} from "three";
import { LayerData, UIDataContext } from "./common/UIDataContext";
import { LayerType } from "./common/LayerTypes";
import getUuid from "uuid-by-string";
import { transformMatrix } from "./utils/transformMatrix";
import { ILocation, ITransformNode } from "@formant/data-sdk";
import { useHelper } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import Path from "./common/Path";
import { FormantColors } from "./utils/FormantColors";

interface IDataVisualizationLayerProps extends IUniverseLayerProps {
  trailEnabled?: boolean;
  trailSeconds?: number;
  trailOpacity?: number;
  trailWidth?: number;
  trailType?: PathType;
  trailFlatten?: boolean;
}

type TreePath = number[];

function findPathToName(
  transformNodes: ITransformNode[],
  name: string,
  pathSoFar?: TreePath
): TreePath {
  const newPathSoFar = pathSoFar || [];

  for (let i = 0; i < transformNodes.length; i += 1) {
    if (transformNodes[i].name === name) {
      newPathSoFar.push(i);
      return newPathSoFar;
    }
  }

  // not found so go down the tree
  for (let i = 0; i < transformNodes.length; i += 1) {
    const { children } = transformNodes[i];
    if (children && children.length > 0) {
      const ret = findPathToName(children, name, [...newPathSoFar, i]);
      if (ret.length > 0) {
        return ret;
      }
    }
  }

  return [];
}

function buildTransformList(
  transformNodes: ITransformNode[],
  path: TreePath,
  transformsSoFar?: { pos: Vector3; rotation: Quaternion }[]
): { pos: Vector3; rotation: Quaternion }[] {
  const newTransformsSoFar = transformsSoFar || [];
  const i = path.shift();
  if (i === undefined) {
    return newTransformsSoFar;
  }
  const node = transformNodes[i];
  const pos = defined(node.transform).translation;
  const { rotation } = defined(node.transform);
  newTransformsSoFar.push({
    pos: new Vector3(pos.x, pos.y, pos.z),
    rotation: new Quaternion(rotation.x, rotation.y, rotation.z, rotation.w),
  });
  if (node.children)
    return buildTransformList(node.children, path, newTransformsSoFar);
  return newTransformsSoFar;
}

export function DataVisualizationLayer(props: IDataVisualizationLayerProps) {
  const [positionUnsubscriber, setPositionUnsubscriber] = useState<
    CloseSubscription | undefined
  >();
  const [thisLayer, setThisLayer] = useState<LayerData | undefined>(undefined);
  const [universeData, liveUniverseData] = useContext(UniverseDataContext);
  const { register, layers, debug } = useContext(UIDataContext);
  const layerData = useContext(LayerContext);
  let deviceId: string | undefined;
  if (layerData) {
    deviceId = layerData.deviceId;
  }
  const {
    children,
    positioning,
    visible,
    name,
    id,
    treePath,
    type,
    iconUrl,
    trailEnabled,
    trailFlatten,
    trailOpacity,
    trailSeconds = 15,
    trailType,
    trailWidth
  } = props;

  const [trailPositions, setTrailPositions] = useState<[number, Vector3][]>([]);

  const groupRef = useRef<Group>(null!);
  // @ts-ignore
  const boxRef = useRef<Object3D<Object3DEventMap>>(debug ? new Box3() : null);
  const colorRef = useRef("yellow");
  useHelper(boxRef, Box3Helper, colorRef.current);

  useEffect(() => {
    const autoId = id || getUuid(JSON.stringify({ name, type, treePath }));
    const registeredLayer = register(
      name || "Layer",
      autoId,
      type || LayerType.OTHER,
      iconUrl,
      treePath,
      visible
    );
    setThisLayer(registeredLayer);
  }, []);

  useEffect(() => {
    const p = positioning || PositioningBuilder.fixed(0, 0, 0);
    if (groupRef.current) {
      const g = groupRef.current;
      if (positionUnsubscriber) {
        positionUnsubscriber();
        setPositionUnsubscriber(undefined);
      }
      if (p.type === "cartesian") {
        const { x, y, z } = p;
        g.position.set(x, y, z);
      } else if (p.type === "gps") {
        const unsubscribe = universeData.subscribeToLocation(
          defined(deviceId, "gps positioning requires a device id"),
          DataSourceBuilder.telemetry(p.stream, "location"),
          (d: ILocation | Symbol) => {
            if (typeof d === "symbol") {
              return;
            }
            const location = d as ILocation;
            const h1 = {
              longitude: location.longitude,
              latitude: location.latitude,
            };
            const h2 = {
              longitude: p.relativeToLongitude,
              latitude: location.latitude,
            };
            let horizontalDistance = getDistance(h1, h2, 0.000001);
            const l1 = {
              longitude: location.longitude,
              latitude: location.latitude,
            };
            const l2 = {
              longitude: location.longitude,
              latitude: p.relativeToLatitude,
            };
            let verticalDistance = getDistance(l1, l2, 0.000001);
            if (location.latitude < p.relativeToLatitude) {
              verticalDistance *= -1;
            }
            if (location.longitude < p.relativeToLongitude) {
              horizontalDistance *= -1;
            }
            const euler = new Euler(0, 0, location.orientation);
            const quaternion = new Quaternion();
            quaternion.setFromEuler(euler);

            g.matrix = new Matrix4().compose(
              new Vector3(
                horizontalDistance,
                verticalDistance,
                location.altitude || 0
              ),
              quaternion,
              new Vector3(1, 1, 1)
            );
            g.matrixAutoUpdate = false;
          }
        );
        setPositionUnsubscriber(() => unsubscribe);
      } else if (p.type === "odometry") {
        let d;
        let streamType;
        if (p.rtcStream) {
          d = DataSourceBuilder.realtime(p.rtcStream, "json");
          streamType = "rtc";
        } else if (p.stream) {
          d = DataSourceBuilder.telemetry(
            p.stream,
            undefined,
            p.useLatestDataPoint || false
          );
          streamType = "telemetry";
        } else {
          throw new Error("invalid odometry positioning stream type");
        }
        const unsubscribe = (
          streamType === "rtc" ? liveUniverseData : universeData
        ).subscribeToOdometry(
          defined(deviceId, "odometry positioning requires a device id"),
          d,
          (d) => {
            if (typeof d === "symbol") {
              return;
            }
            const odom = d as IUniverseOdometry;
            const pos = odom.pose.translation;
            const rot = odom.pose.rotation;
            if (d.trail && trailEnabled) {
              const _trailPositions = d.trail.map((p) => [p[0], new Vector3(p[1].translation.x, p[1].translation.y, p[1].translation.z)]);
              setTrailPositions(_trailPositions);
            } else if (trailEnabled) {
              const _trailPosition = [universeData.getTimeMs(), new Vector3(pos.x, pos.y, pos.z)] as [number, Vector3];
              setTrailPositions((prev) => [...prev.filter((p) => universeData.getTimeMs() - p[0] < trailSeconds * 1000), _trailPosition]);
            }
            g.position.set(pos.x, pos.y, pos.z);
            g.setRotationFromQuaternion(
              new Quaternion(rot.x, rot.y, rot.z, rot.w)
            );
            if (p.useWorldToLocalTransform && odom.worldToLocal) {
              const worldToLocalMatrix = transformMatrix(odom.worldToLocal);
              g.matrix.copy(worldToLocalMatrix);
            }
          },
          trailSeconds
        );
        setPositionUnsubscriber(() => unsubscribe);
      } else if (p.type === "transform tree") {
        const unsubscribe = universeData.subscribeToTransformTree(
          defined(deviceId, "transform tree positioning requires a device id"),
          DataSourceBuilder.telemetry(p.stream, "transform tree"),
          (d: ITransformNode | Symbol) => {
            if (typeof d === "symbol") {
              return;
            }
            const transformTree = d as ITransformNode;
            fetch(defined(transformTree.url))
              .then((res) => res.json())
              .then((tree) => {
                const pathToName = findPathToName([tree], defined(p.end));
                const transforms = buildTransformList([tree], pathToName);
                const transformMatrices = transforms.map((_) =>
                  new Matrix4().compose(
                    new Vector3(_.pos.x, _.pos.y, _.pos.z),
                    _.rotation,
                    new Vector3(1, 1, 1)
                  )
                );
                const transformMatrix = transformMatrices.reduce(
                  (acc, curr) => acc.multiply(curr),
                  new Matrix4()
                );

                g.matrix = transformMatrix;
                g.matrixAutoUpdate = false;
              })
              .catch((err) => {
                throw err;
              });
          }
        );
        setPositionUnsubscriber(() => unsubscribe);
      }
    }

    return () => {
      if (positionUnsubscriber) {
        positionUnsubscriber();
        setPositionUnsubscriber(undefined);
      }
    };
  }, [groupRef, positioning, thisLayer]);


  useFrame(() => {
    if (groupRef.current && debug) {
      // @ts-ignore
      const box = boxRef.current as Box3;
      const g = groupRef.current;
      box.setFromObject(g);
    }
  });




  return (
    <>
      <group
        visible={thisLayer ? thisLayer.visible : true}
        ref={groupRef}
        name={thisLayer ? thisLayer.id : ""}
      >
        {children}
      </group >
      <Path
        points={trailPositions.map((p) => p[1])}
        color={FormantColors.mithril}
        pathOpacity={trailOpacity}
        pathWidth={trailWidth}
        pathType={trailType}
        pathFlatten={trailFlatten}
        renderOrder={1}
      />
    </>
  );
}
