import React, { useContext, useEffect, useRef, useState } from "react";
import { getDistance } from "geolib";
import { IUniverseLayerProps } from "./types";
import { UniverseDataContext } from "./common/UniverseDataContext";
import { PositioningBuilder } from "./utils/PositioningBuilder";
import { LayerContext } from "./common/LayerContext";
import {
  CloseSubscription,
  defined,
  ILocation,
  ITransformNode,
  IUniverseOdometry,
} from "@formant/universe-core";
import { DataSourceBuilder } from "./utils/DataSourceBuilder";
import { Euler, Matrix4, Quaternion, Vector3 } from "three";
import { LayerData, UIDataContext } from "./common/UIDataContext";
import { LayerType } from "./common/LayerTypes";
import getUuid from "uuid-by-string";
import { transformMatrix } from "./utils/transformMatrix";

interface IDataVisualizationLayerProps extends IUniverseLayerProps {}

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
  const universeData = useContext(UniverseDataContext);
  const layerData = useContext(LayerContext);
  let deviceId: string | undefined;
  if (layerData) {
    deviceId = layerData.deviceId;
  }
  const { children, positioning, visible, name, id, treePath, type, iconUrl } =
    props;
  const groupRef = useRef<THREE.Group>(null!);

  const { register, layers } = useContext(UIDataContext);
  useEffect(() => {
    const autoId = id || getUuid(JSON.stringify({ name, type, treePath }));
    const registeredLayer = register(
      name || "Layer",
      autoId,
      type || LayerType.OTHER,
      iconUrl,
      treePath
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
          (d) => {
            if (typeof d === "symbol") {
              console.warn("unhandled empty gps location");
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
        if (p.stream && p.streamType === "localization") {
          d = DataSourceBuilder.telemetry(p.stream, p.streamType);
        } else if (p.rtcStream) {
          d = DataSourceBuilder.realtime(p.rtcStream, "json");
        } else {
          throw new Error("invalid odometry positioning stream type");
        }
        const unsubscribe = universeData.subscribeToOdometry(
          defined(deviceId, "odometry positioning requires a device id"),
          d,
          (d) => {
            if (typeof d === "symbol") {
              console.warn("unhandled empty odometry");
              return;
            }
            const odom = d as IUniverseOdometry;
            const pos = odom.pose.translation;
            const rot = odom.pose.rotation;
            g.position.set(pos.x, pos.y, pos.z);
            g.setRotationFromQuaternion(
              new Quaternion(rot.x, rot.y, rot.z, rot.w)
            );
            if (p.useWorldToLocalTransform && odom.worldToLocal) {
              const worldToLocalMatrix = transformMatrix(odom.worldToLocal);
              g.matrix.copy(worldToLocalMatrix);
            }
          }
        );
        setPositionUnsubscriber(() => unsubscribe);
      } else if (p.type === "transform tree") {
        const unsubscribe = universeData.subscribeToTransformTree(
          defined(deviceId, "transform tree positioning requires a device id"),
          DataSourceBuilder.telemetry(p.stream, "transform tree"),
          (d) => {
            if (typeof d === "symbol") {
              console.warn("unhandled empty transform tree");
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
  }, [groupRef, positioning, thisLayer]);

  return (
    <group
      visible={thisLayer ? thisLayer.visible : true}
      ref={groupRef}
      name={thisLayer ? thisLayer.id : ""}
    >
      {children}
    </group>
  );
}
