import { IUniversePath, UniverseTelemetrySource } from "@formant/data-sdk";
import { useContext, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useControlsContext } from "./common/ControlsContext";
import { LayerContext } from "./common/LayerContext";
import Path from "./common/Path";
import { UniverseDataContext } from "./common/UniverseDataContext";
import { DataVisualizationLayer } from "./DataVisualizationLayer";
import { IUniverseLayerProps, PathType } from "./types";
import { FormantColors } from "./utils/FormantColors";
import { transformMatrix } from "./utils/transformMatrix";

interface ILocalPathProps extends IUniverseLayerProps {
  dataSource?: UniverseTelemetrySource;
  pathOpacity?: number;
  pathType?: PathType;
  pathWidth?: number;
  flatten?: boolean;
}

export const PathLayer = (props: ILocalPathProps) => {
  const {
    dataSource,
    pathOpacity = 50,
    pathWidth = 0.25,
    pathType = PathType.STATIC,
    flatten = false,
  } = props;
  const {
    state: { hasPath },
  } = useControlsContext();
  const [universeData, liveUniverseData] = useContext(UniverseDataContext);
  const layerData = useContext(LayerContext);
  const [points, setPoints] = useState<THREE.Vector3[]>([]);
  const [url, setUrl] = useState<string | undefined>(undefined);
  const groupRef = useRef<THREE.Group>(null!);

  useEffect(() => {
    if (url) {
      // Fetch path data from URL
      fetch(url)
        .then((response) => response.json())
        .then((data: IUniversePath) => {
          const { poses, worldToLocal } = data;

          setPoints(
            poses.map(
              (pos) =>
                new THREE.Vector3(
                  pos.translation.x,
                  pos.translation.y,
                  pos.translation.z
                )
            )
          );

          if (!groupRef.current) return;
          const group = groupRef.current;
          group.matrixAutoUpdate = false;
          group.matrix.copy(transformMatrix(worldToLocal));
        })
        .catch((error) => {
          console.error("Failed to fetch path data from URL:", error);
        });
    }
  }, [url]);

  useEffect(() => {
    if (!layerData) return;

    const { deviceId } = layerData;

    if (!dataSource) return;

    dataSource.streamType = "localization";

    const unsubscribe = universeData.subscribeToPath(
      deviceId,
      dataSource,
      (data: IUniversePath | Symbol) => {
        if (typeof data === "symbol") return;

        const { poses, worldToLocal, url: _url } = data as IUniversePath;

        // Set up transform matrix first (like OccupancyGridLayer does)
        if (!groupRef.current) return;
        const group = groupRef.current;
        group.matrixAutoUpdate = false;
        if (worldToLocal) {
          group.matrix.copy(transformMatrix(worldToLocal));
        }

        if (_url) {
          // URL is available, use URL-based fetching
          setUrl(_url);
          return;
        }

        if (!poses) {
          return;
        }

        // Fallback to direct data processing if no URL
        setPoints(
          poses.map(
            (pos) =>
              new THREE.Vector3(
                pos.translation.x,
                pos.translation.y,
                pos.translation.z
              )
          )
        );
      }
    );

    return () => {
      unsubscribe();
    };
  }, [layerData, universeData, setPoints]);

  return (
    <DataVisualizationLayer {...props} iconUrl="icons/3d_object.svg">
      <Path
        points={points}
        color={FormantColors.mithril}
        pathOpacity={pathOpacity}
        pathWidth={pathWidth}
        pathType={pathType}
        pathFlatten={flatten}
        renderOrder={0}
      />
    </DataVisualizationLayer>
  );
};
