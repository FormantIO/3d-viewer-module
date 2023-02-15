import { useContext, useEffect, useRef, useState } from "react";
import { IUniverseLayerProps } from "./types";
import { UniverseDataContext } from "./common/UniverseDataContext";
import { LayerContext } from "./common/LayerContext";
import { DataVisualizationLayer } from "./DataVisualizationLayer";
import { defined, UniverseTelemetrySource } from "@formant/universe-core";
import { PointCloudMaterial } from "./utils/PointCloudMaterial";
extend({ PointCloudMaterial });

import { extend } from "@react-three/fiber";
import { BufferAttribute, BufferGeometry } from "three";
import { IUniversePath } from "@formant/universe-core/dist/types/universe-core/src/model/IUniversePath";

interface ILocalPathProps extends IUniverseLayerProps {
  dataSource?: UniverseTelemetrySource;
}

export const LocalPathLayer = (props: ILocalPathProps) => {
  const { dataSource } = props;
  const universeData = useContext(UniverseDataContext);
  const layerData = useContext(LayerContext);

  useEffect(() => {}, []);

  useEffect(() => {
    if (!layerData) return;

    const { deviceId } = layerData;

    if (!dataSource) return;

    dataSource.streamType = "localization";

    console.log("here local path layer");

    const unsubscribe = universeData.subscribeToPath(
      deviceId,
      dataSource,
      (data: IUniversePath | Symbol) => {
        if (typeof data === "symbol") return;
        //   const pc = data as IUniversePointCloud;
        console.log("**", data, JSON.stringify(data));
      }
    );

    return () => {
      unsubscribe();
    };
  }, [layerData, universeData]);

  return (
    <DataVisualizationLayer {...props} iconUrl="../icons/3d_object.svg">
      <mesh>
        <planeGeometry />
      </mesh>
    </DataVisualizationLayer>
  );
};
