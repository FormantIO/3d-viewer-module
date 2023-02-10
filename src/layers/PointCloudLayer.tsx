import { useContext, useEffect, useRef, useState } from "react";
import { IUniverseLayerProps } from "./types";
import { UniverseDataContext } from "./common/UniverseDataContext";
import { LayerContext } from "./common/LayerContext";
import { DataVisualizationLayer } from "./DataVisualizationLayer";
import { IPcd, UniverseTelemetrySource } from "@formant/universe-core";
import { PointCloudMaterial } from "./utils/PointCloudMaterial";
extend({ PointCloudMaterial });

interface IPointCloudProps extends IUniverseLayerProps {
  dataSource?: UniverseTelemetrySource;
}
import { LayerType } from "./common/LayerTypes";
import { extend } from "@react-three/fiber";
import { BufferAttribute, BufferGeometry } from "three";

export const PointCloudLayer = (props: IPointCloudProps) => {
  const { dataSource } = props;
  const universeData = useContext(UniverseDataContext);
  const layerData = useContext(LayerContext);
  const [positions, setPositions] = useState<Float32Array>(
    new Float32Array([])
  );
  const pointGeo = useRef<BufferGeometry>(null!);

  useEffect(() => {
    if (!pointGeo.current) return;
    const geom = pointGeo.current;
    const MAX_POINTS = 350000;
    geom.setAttribute(
      "position",
      new BufferAttribute(new Float32Array(MAX_POINTS * 3), 3)
    );
    geom.setDrawRange(0, 0);
  }, [pointGeo]);

  useEffect(() => {
    if (!layerData) return;

    const { deviceId } = layerData;

    if (dataSource) {
      dataSource.streamType = "localization";
      const unsubscribe = universeData.subscribeToPointCloud(
        deviceId,
        dataSource,
        (data: IPcd | Symbol) => {
          if (typeof data === "symbol") return;
          const pcd = data as IPcd;
          if (pcd.positions && pcd.positions.length && pointGeo.current) {
            const geo = pointGeo.current;
            geo.setDrawRange(0, pcd.positions ? pcd.positions.length / 3 : 0);
            const points = Array.from(pcd.positions || []);
            const positionAttr = geo.attributes.position as BufferAttribute;
            positionAttr.set(points, 0);
            positionAttr.needsUpdate = true;
          }
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
          <bufferGeometry attach="geometry" ref={pointGeo} />

          {/* <pointsMaterial
            attach="material"
            color={[4, 3.0, 1]}
            size={0.1}
            sizeAttenuation
            transparent={false}
            alphaTest={0.5}
            opacity={1.0}
          /> */}

          <pointCloudMaterial args={[5, "#13bff3", "#cf34bb"]} />
        </points>
      )}
    </DataVisualizationLayer>
  );
};
