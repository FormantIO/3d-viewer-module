import { IUniversePath, UniverseTelemetrySource } from "@formant/data-sdk";
import { useContext, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useControlsContext } from "./common/ControlsContext";
import { LayerContext } from "./common/LayerContext";
import Path from "./common/Path";
import { PathLoader, IPathAssetData } from "./common/PathLoader";
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
  const [isReady, setIsReady] = useState(true);
  const groupRef = useRef<THREE.Group>(null!);

  // Handle URL-based asset loading using PathLoader
  const handlePathUrl = (url: string) => {
    const pathLoader = PathLoader.get();
    
    setIsReady(false);
    pathLoader
      .load(url)
      .then((data: IPathAssetData) => {
        const { poses: pathPoses, worldToLocal } = data;
        if (pathPoses && Array.isArray(pathPoses)) {
          setPoints(
            pathPoses.map(
              (pose) =>
                new THREE.Vector3(
                  pose.translation.x,
                  pose.translation.y,
                  pose.translation.z,
                ),
            ),
          );

          if (groupRef.current && worldToLocal) {
            const group = groupRef.current;
            group.matrixAutoUpdate = false;
            group.matrix.copy(transformMatrix(worldToLocal));
          }
        }
        setIsReady(true);
      })
      .catch(error => {
        console.error("Failed to load path asset from URL:", url, error);
        setPoints([]);
        setIsReady(true);
      });
  };

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

        const pathData = data as any;

        // Check if path data contains a URL (S3 asset)
        if (pathData.url && pathData.url.trim() !== "") {
          // Path data is stored as S3 asset, load using PathLoader
          handlePathUrl(pathData.url);
        } else if (pathData.poses && Array.isArray(pathData.poses)) {
          // Direct poses access (backward compatibility)
          const { poses, worldToLocal } = pathData;

          setPoints(
            poses.map(
              (pos: any) =>
                new THREE.Vector3(
                  pos.translation.x,
                  pos.translation.y,
                  pos.translation.z,
                ),
            ),
          );

          if (groupRef.current && worldToLocal) {
            const group = groupRef.current;
            group.matrixAutoUpdate = false;
            group.matrix.copy(transformMatrix(worldToLocal));
          }
          setIsReady(true);
        } else {
          // No valid path data
          setPoints([]);
          setIsReady(true);
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [layerData, universeData]);

  return (
    <DataVisualizationLayer {...props} iconUrl="icons/3d_object.svg">
      {isReady && (
        <group ref={groupRef}>
          <Path
            points={points}
            color={FormantColors.mithril}
            pathOpacity={pathOpacity}
            pathWidth={pathWidth}
            pathType={pathType}
            pathFlatten={flatten}
            renderOrder={0}
          />
        </group>
      )}
    </DataVisualizationLayer>
  );
};
