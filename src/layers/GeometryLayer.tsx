import {
  defined,
  definedAndNotNull,
  IMarker3DArray,
} from "@formant/universe-core";
import React, { useContext, useEffect, useRef, useState } from "react";
import {
  BoxGeometry,
  BufferGeometry,
  Color,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  Texture,
  Vector3,
} from "three";
import { LayerDataContext } from "../LayerDataContext";
import { UniverseTelemetrySource } from "../model/DataSource";
import { GeometryWorld } from "../objects/GeometryWorld";
import { UniverseDataContext } from "../UniverseDataContext";
import { TransformLayer } from "./TransformLayer";
import { IUniverseLayerProps } from "./types";

interface IGeometryLayer extends IUniverseLayerProps {
  dataSource: UniverseTelemetrySource;
}

export function GeometryLayer(props: IGeometryLayer) {
  const { children, dataSource } = props;
  const world = new GeometryWorld();

  const worldGeometry: Map<string, Mesh | Line | Sprite> = new Map();

  const root = new Object3D();
  const universeData = useContext(UniverseDataContext);
  const layerData = useContext(LayerDataContext);

  useEffect(() => {
    universeData.subscribeToGeometry(
      definedAndNotNull(layerData, "geometry layer requires device context")
        .deviceId,
      dataSource,
      (d) => {
        if (typeof d === "symbol") {
          console.error("geometry received error from universe data");
          return;
        }
        const markerArray = d as IMarker3DArray;
        world.processMarkers(markerArray);
        const geometry = world.getAllGeometry();

        geometry.forEach((g) => {
          if (g.dirty) {
            const mesh = worldGeometry.get(g.id);
            if (g.type === "line_list") {
              if (!mesh) {
                const material = new LineBasicMaterial({
                  color: new Color(g.color.r, g.color.g, g.color.b),
                  opacity: g.color.a,
                });

                const meshGeometry = new BufferGeometry().setFromPoints(
                  g.points as Vector3[]
                );
                const lines = new Line(meshGeometry, material);
                lines.position.set(g.position.x, g.position.y, g.position.z);
                lines.scale.set(g.scale.x, g.scale.y, g.scale.z);
                lines.rotation.set(g.rotation.x, g.rotation.y, g.rotation.z);

                root.add(lines);
                worldGeometry.set(g.id, lines);
              } else {
                mesh.geometry.setFromPoints(g.points as Vector3[]);
                mesh.position.set(g.position.x, g.position.y, g.position.z);
                mesh.scale.set(g.scale.x, g.scale.y, g.scale.z);
                mesh.rotation.set(g.rotation.x, g.rotation.y, g.rotation.z);
                mesh.material = new LineBasicMaterial({
                  color: new Color(g.color.r, g.color.g, g.color.b),
                  opacity: g.color.a,
                });
              }
            } else if (g.type === "text") {
              const fontface = "Arial";
              const fontsize = 30;
              const message = g.text;
              const font = `${fontsize}px ${fontface}`;

              const canvas = document.createElement("canvas");
              const context = definedAndNotNull(canvas.getContext("2d"));

              // get size data (height depends only on font size)
              context.font = font;
              const metrics = context.measureText(message);
              const textWidth = metrics.width;
              const textHeight = fontsize;
              canvas.width = textWidth;
              canvas.height = textHeight;
              context.fillStyle = "#2d3855";
              context.fillRect(0, 0, textWidth, textHeight);

              // background color
              context.font = font;
              context.fillStyle = "#bac4e2";
              context.fillText(message, 0, fontsize);

              // canvas contents will be used for a texture
              const texture = new Texture(canvas);
              texture.needsUpdate = true;

              const spriteMaterial = new SpriteMaterial({
                map: texture,
              });

              if (!mesh) {
                const sprite = new Sprite(spriteMaterial);
                // make things less blurrier
                const pixelScale = 4;
                // scale sprite so it isn't stretched
                sprite.scale.set(
                  1 / pixelScale,
                  textHeight / textWidth / pixelScale,
                  1.0 / pixelScale
                );
                root.add(sprite);
                worldGeometry.set(g.id, sprite);
              } else {
                mesh.material = spriteMaterial;
              }
            } else if (g.type === "sphere" || g.type === "cube") {
              if (!mesh) {
                const meshGeometry =
                  g.type === "sphere"
                    ? new SphereGeometry(1, 32, 16)
                    : new BoxGeometry(1, 1, 1);
                const material = new MeshBasicMaterial({
                  color: new Color(g.color.r, g.color.g, g.color.b),
                  opacity: g.color.a,
                });
                const sphere = new Mesh(meshGeometry, material);
                sphere.position.set(g.position.x, g.position.y, g.position.z);
                sphere.scale.set(g.scale.x, g.scale.y, g.scale.z);
                sphere.rotation.set(g.rotation.x, g.rotation.y, g.rotation.z);

                root.add(sphere);
                worldGeometry.set(g.id, sphere);
              } else {
                mesh.position.set(g.position.x, g.position.y, g.position.z);
                mesh.scale.set(g.scale.x, g.scale.y, g.scale.z);
                mesh.rotation.set(g.rotation.x, g.rotation.y, g.rotation.z);
                mesh.material = new MeshBasicMaterial({
                  color: new Color(g.color.r, g.color.g, g.color.b),
                  opacity: g.color.a,
                });
              }
            } else if (g.type === "arrow") {
              if (!mesh) {
                const material = new LineBasicMaterial({
                  color: new Color(g.color.r, g.color.g, g.color.b),
                  opacity: g.color.a,
                });

                const meshGeometry = new BufferGeometry().setFromPoints(
                  g.points as Vector3[]
                );
                const lines = new Line(meshGeometry, material);
                lines.position.set(g.position.x, g.position.y, g.position.z);
                lines.scale.set(g.scale.x, g.scale.y, g.scale.z);
                lines.rotation.set(g.rotation.x, g.rotation.y, g.rotation.z);

                root.add(lines);
                worldGeometry.set(g.id, lines);
              } else {
                mesh.geometry.setFromPoints(g.points as Vector3[]);
                mesh.position.set(g.position.x, g.position.y, g.position.z);
                mesh.scale.set(g.scale.x, g.scale.y, g.scale.z);
                mesh.rotation.set(g.rotation.x, g.rotation.y, g.rotation.z);
                mesh.material = new LineBasicMaterial({
                  color: new Color(g.color.r, g.color.g, g.color.b),
                  opacity: g.color.a,
                });
              }
            }
            g.dirty = false;
          }
        });

        const oldGeoIds = [...worldGeometry.keys()];
        const newGeoIds = geometry.map((g) => g.id);
        const toRemove = oldGeoIds.filter((id) => !newGeoIds.includes(id));
        toRemove.forEach((id) => {
          root.remove(defined(worldGeometry.get(id)));
          worldGeometry.delete(id);
        });
      }
    );
  });
  return (
    <TransformLayer positioning={props.positioning}>
      <primitive object={root} />
      {children}
    </TransformLayer>
  );
}
