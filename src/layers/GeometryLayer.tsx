import {
  defined,
  definedAndNotNull,
  IMarker3DArray,
  UniverseTelemetrySource,
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
import { LayerContext } from "./common/LayerContext";
import { GeometryWorld } from "./objects/GeometryWorld";
import { UniverseDataContext } from "./common/UniverseDataContext";
import { DataVisualizationLayer } from "./DataVisualizationLayer";
import { IUniverseLayerProps } from "./types";

interface IGeometryLayer extends IUniverseLayerProps {
  dataSource: UniverseTelemetrySource;
}

//lets make a really efficient cache for materials based on color
const materialCache = new Map<string, MeshBasicMaterial>();

const getOrCreateMaterial = (r: number, g: number, b: number, a: number) => {
  const key = `${r},${g},${b},${a}`;
  let material = materialCache.get(key);
  if (!material) {
    material = new MeshBasicMaterial({
      color: new Color(r, g, b),
      opacity: a,
    });
    materialCache.set(key, material);
  }
  return material;
};

export function GeometryLayer(props: IGeometryLayer) {
  const { children, dataSource } = props;
  const world = new GeometryWorld();

  const worldGeometry: Map<string, Mesh | Line | Sprite> = new Map();

  const root = new Object3D();
  const universeData = useContext(UniverseDataContext);
  const layerData = useContext(LayerContext);

  useEffect(() => {
    universeData.subscribeToGeometry(
      definedAndNotNull(layerData, "geometry layer requires device context")
        .deviceId,
      dataSource,
      (d) => {
        if (typeof d === "symbol") {
          console.warn("geometry received error from universe data");
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
                const p = g.position;
                if (
                  mesh.position.x !== p.x ||
                  mesh.position.y !== p.y ||
                  mesh.position.z !== p.z
                ) {
                  mesh.position.set(p.x, p.y, p.z);
                }
                const s = g.scale;
                if (
                  mesh.scale.x !== s.x ||
                  mesh.scale.y !== s.y ||
                  mesh.scale.z !== s.z
                ) {
                  mesh.scale.set(s.x, s.y, s.z);
                }
                const r = g.rotation;
                if (
                  mesh.rotation.x !== r.x ||
                  mesh.rotation.y !== r.y ||
                  mesh.rotation.z !== r.z
                ) {
                  mesh.rotation.set(r.x, r.y, r.z);
                }
                const m = mesh.material as MeshBasicMaterial;
                if (
                  m.color.r !== g.color.r ||
                  m.color.g !== g.color.g ||
                  m.color.b !== g.color.b ||
                  m.opacity !== g.color.a
                ) {
                  mesh.material = new MeshBasicMaterial({
                    color: new Color(g.color.r, g.color.g, g.color.b),
                    opacity: g.color.a,
                  });
                }
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
        const newGeoIds = new Set(geometry.map((g) => g.id));
        const toRemove = oldGeoIds.filter((id) => !newGeoIds.has(id));
        toRemove.forEach((id) => {
          root.remove(defined(worldGeometry.get(id)));
          worldGeometry.delete(id);
        });
      }
    );
  });
  return (
    <DataVisualizationLayer {...props} iconUrl="icons/3d_object.svg">
      <primitive object={root} />
      {children}
    </DataVisualizationLayer>
  );
}
