import { useContext, useEffect, useRef, useState } from "react";
import { IUniverseLayerProps, PathType } from "./types";
import { UniverseDataContext } from "./common/UniverseDataContext";
import { LayerContext } from "./common/LayerContext";
import { DataVisualizationLayer } from "./DataVisualizationLayer";
import { UniverseTelemetrySource, IUniversePath } from "@formant/data-sdk";
import * as THREE from "three";
import { transformMatrix } from "./utils/transformMatrix";
import { FormantColors } from "./utils/FormantColors";
import { useControlsContext } from "./common/ControlsContext";
import Path from "./common/Path";

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
  const groupRef = useRef<THREE.Group>(null!);

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

        const { poses, worldToLocal } = data as IUniversePath;

        setPoints(
          poses.map((pos) => new THREE.Vector3(pos.translation.x, pos.translation.y, pos.translation.z))
        );

        if (!groupRef.current) return;
        const group = groupRef.current;
        group.matrixAutoUpdate = false;
        group.matrix.copy(transformMatrix(worldToLocal));
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
        color={FormantColors.blue}
        pathOpacity={pathOpacity}
        pathWidth={pathWidth}
        pathType={pathType}
        pathFlatten={flatten}
        renderOrder={0}
      />
    </DataVisualizationLayer>
  );
};
