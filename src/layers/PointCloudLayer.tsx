import { useContext, useEffect, useState } from "react";
import { LayerDataContext } from "./common/LayerDataContext";
import { DataSourceBuilder } from "./utils/DataSourceBuilder";
import { UIDataContext } from "./common/UIDataContext";
import { UniverseDataContext } from "./common/UniverseDataContext";
import { DataVisualizationLayer } from "./DataVisualizationLayer";
import * as uuid from "uuid";
import { IUniverseLayerProps } from "./types";

interface IPointCloudProps extends IUniverseLayerProps {}

export const PointCloudLayer = (props: IPointCloudProps) => {
  const universeData = useContext(UniverseDataContext);
  const layerData = useContext(LayerDataContext);
  const [positions, setPositions] = useState([]);

  useEffect(() => {
    if (!layerData) return;

    const { deviceId } = layerData;

    const unsubscribe = universeData.subscribeToPointCloud(
      deviceId,
      DataSourceBuilder.telemetry("eko.geo", "point cloud"),
      (data: any) => {
        if (data.positions) setPositions(data.positions);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [layerData, universeData, setPositions]);

  return (
    <DataVisualizationLayer {...props}>
      {positions.length > 0 && (
        <points>
          <bufferGeometry attach="geometry">
            <bufferAttribute
              attach="attributes-position"
              array={positions}
              count={positions.length / 3}
              itemSize={3}
            />
          </bufferGeometry>

          <pointsMaterial
            attach="material"
            color={[4, 3.0, 1]}
            size={0.05}
            sizeAttenuation
            transparent={false}
            alphaTest={0.5}
            opacity={1.0}
          />
        </points>
      )}
    </DataVisualizationLayer>
  );
};
