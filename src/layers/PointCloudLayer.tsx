import { useContext, useEffect, useState } from "react";
import { IUniverseLayerProps } from "./types";
import { UniverseDataContext } from "./common/UniverseDataContext";
import { LayerDataContext } from "./common/LayerDataContext";
import { DataVisualizationLayer } from "./DataVisualizationLayer";
import { UniverseTelemetrySource } from "@formant/universe-core";
import { PointCloudMaterial } from "./utils/PointCloudMaterial";
extend({ PointCloudMaterial });

interface IPointCloudProps extends IUniverseLayerProps {
  dataSource?: UniverseTelemetrySource;
}
import { LayerType } from "./common/LayerTypes";
import { extend } from "@react-three/fiber";

export const PointCloudLayer = (props: IPointCloudProps) => {
  const { dataSource } = props;
  const universeData = useContext(UniverseDataContext);
  const layerData = useContext(LayerDataContext);
  const [positions, setPositions] = useState([]);

  useEffect(() => {
    if (!layerData) return;

    const { deviceId } = layerData;

    if (dataSource) {
      dataSource.streamType = "localization";
      const unsubscribe = universeData.subscribeToPointCloud(
        deviceId,
        dataSource,
        (data: any) => {
          if (data.positions) setPositions(data.positions);
        }
      );

      return () => {
        unsubscribe();
      };
    }
  }, [layerData, universeData, setPositions]);

  return (
    <DataVisualizationLayer {...props} type={LayerType.POINTCLOUD}>
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

          {/* <pointsMaterial
            attach="material"
            color={[4, 3.0, 1]}
            size={0.1}
            sizeAttenuation
            transparent={false}
            alphaTest={0.5}
            opacity={1.0}
          /> */}

          <pointCloudMaterial args={[10, "#0bc6ff", "#cf34bb"]} />
        </points>
      )}
    </DataVisualizationLayer>
  );
};
