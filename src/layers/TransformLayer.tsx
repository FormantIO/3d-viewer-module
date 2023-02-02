import React, { useContext, useEffect, useRef, useState } from "react";
import { getDistance } from "geolib";
import { IUniverseLayerProps } from "./types";
import { UniverseDataContext } from "../UniverseDataContext";
import { PositioningBuilder } from "../model/PositioningBuilder";
import { LayerDataContext } from "../LayerDataContext";
import {
  CloseSubscription,
  defined,
  ILocation,
  IOdometry,
  ITransformNode,
} from "@formant/universe-core";
import { DataSourceBuilder } from "../model/DataSourceBuilder";
import { Euler, Matrix4, Quaternion, Vector3 } from "three";
import { UIDataContext } from "../UIDataContext";
import * as uuid from "uuid";

interface ITransformLayerProps extends IUniverseLayerProps {}

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

export function TransformLayer(props: ITransformLayerProps) {
  const [positionUnsubscriber, setPositionUnsubscriber] = useState<
    CloseSubscription | undefined
  >();
  const universeData = useContext(UniverseDataContext);
  const layerData = useContext(LayerDataContext);
  let deviceId: string | undefined;
  if (layerData) {
    deviceId = layerData.deviceId;
  }
  const { children, positioning, visible, name, id, treePath } = props;
  const groupRef = useRef<THREE.Group>(null!);

  const { register, layers } = useContext(UIDataContext);
  useEffect(() => {
    register(name || "Layer", id || uuid.v4(), treePath);
  }, []);
  const thisLayer = layers.find((layer) => layer.id === id);

  useEffect(() => {
    const p = positioning || PositioningBuilder.fixed(0, 0, 0);
    if (groupRef.current) {
      const g = groupRef.current;
      if (positionUnsubscriber) {
        positionUnsubscriber();
        setPositionUnsubscriber(undefined);
      }
      if (p.type === "fixed") {
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
        if (p.stream) {
          d = DataSourceBuilder.telemetry(p.stream, "localization");
        } else if (p.rtcStream) {
          d = DataSourceBuilder.realtime(p.rtcStream, "json");
        } else {
          throw new Error("invalid odometry positioning");
        }
        const unsubscribe = universeData.subscribeToOdometry(
          defined(deviceId, "odometry positioning requires a device id"),
          d,
          (d) => {
            if (typeof d === "symbol") {
              console.warn("unhandled empty odometry");
              return;
            }
            const odom = d as IOdometry;
            const pos = odom.pose.translation;
            const rot = odom.pose.rotation;
            g.position.set(pos.x, pos.y, pos.z);
            g.setRotationFromQuaternion(
              new Quaternion(rot.x, rot.y, rot.z, rot.w)
            );
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
  }, [groupRef, positioning]);

  return (
    <group
      visible={visible || thisLayer?.visible}
      ref={groupRef}
      name={props.id}
    >
      {children}
    </group>
  );
}
