import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { IUniverseLayerProps, PathType } from "./types";
import { UniverseDataContext } from "./common/UniverseDataContext";
import { LayerContext } from "./common/LayerContext";
import { DataVisualizationLayer } from "./DataVisualizationLayer";
import { UniverseTelemetrySource, IUniversePath } from "@formant/data-sdk";
import * as THREE from "three";
import { transformMatrix } from "./utils/transformMatrix";
import { FormantColors } from "./utils/FormantColors";
import { Line } from "@react-three/drei";
import { useControlsContext } from "./common/ControlsContext";
import { PathGeometry } from "./utils/PathGeometry";
import { extend } from "@react-three/fiber";
extend({ PathGeometry });

interface ILocalPathProps extends IUniverseLayerProps {
  dataSource?: UniverseTelemetrySource;
  pathOpacity?: number;
  pathType?: PathType;
  pathWidth?: number;
}

export const PathLayer = (props: ILocalPathProps) => {
  const {
    dataSource,
    pathOpacity = 50,
    pathWidth = 0.25,
    pathType = PathType.STATIC,
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
          <>
            {pathType === PathType.STATIC ? (
              <mesh>
                <pathGeometry args={[points, pathWidth, points.length]} />
                <meshBasicMaterial
                  transparent
                  opacity={pathOpacity / 100}
                  color={FormantColors.blue}
                />
              </mesh>
            ) : (
              <Line
                points={points}
                lineWidth={18}
                color={FormantColors.blue}
                worldUnits={false}
                renderOrder={1}
              />
            )}
          </>
        )}
      </group>
    </DataVisualizationLayer>
  );
};
