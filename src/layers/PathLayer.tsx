import { useContext, useEffect, useRef, useState } from "react";
import { IUniverseLayerProps, PathType } from "./types";
import { UniverseDataContext } from "./common/UniverseDataContext";
import { LayerContext } from "./common/LayerContext";
import { DataVisualizationLayer } from "./DataVisualizationLayer";
import { UniverseTelemetrySource } from "@formant/universe-core";
import * as THREE from "three";
import { IUniversePath } from "@formant/universe-core/dist/types/universe-core/src/model/IUniversePath";
import { transformMatrix } from "./utils/transformMatrix";
import { FormantColors } from "./utils/FormantColors";
import { Line } from "@react-three/drei";
import { useControlsContext } from "./common/ControlsContext";

interface ILocalPathProps extends IUniverseLayerProps {
  dataSource?: UniverseTelemetrySource;
  pathType?: PathType;
  pathWidth?: number;
}

export const PathLayer = (props: ILocalPathProps) => {
  const { dataSource, pathWidth = 0.5, pathType = PathType.DYNAMIC } = props;
  const {
    state: { hasPath },
  } = useControlsContext();
  const universeData = useContext(UniverseDataContext);
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

        const positions = poses.map((pose) => pose.translation);

        const worldToLocalMatrix = transformMatrix(worldToLocal);

        setPoints(
          positions.map((pos) => new THREE.Vector3(pos.x, pos.y, pos.z))
        );

        const group = groupRef.current;
        group.matrixAutoUpdate = false;
        group.matrix.copy(worldToLocalMatrix);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [layerData, universeData, setPoints]);

  return (
    <DataVisualizationLayer {...props} iconUrl="icons/3d_object.svg">
      <group ref={groupRef} visible={hasPath}>
        {points.length > 0 && (
          <Line
            points={points}
            lineWidth={pathType === PathType.DYNAMIC ? 10 : pathWidth}
            color={FormantColors.blue}
            worldUnits={pathType === PathType.STATIC}
            transparent
            opacity={0.5}
          />
        )}
      </group>
    </DataVisualizationLayer>
  );
};
