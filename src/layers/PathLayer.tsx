import { useContext, useEffect, useState } from "react";
import { IUniverseLayerProps } from "./types";
import { UniverseDataContext } from "./common/UniverseDataContext";
import { LayerContext } from "./common/LayerContext";
import { DataVisualizationLayer } from "./DataVisualizationLayer";
import { UniverseTelemetrySource } from "@formant/universe-core";
import * as THREE from "three";
import { IUniversePath } from "@formant/universe-core/dist/types/universe-core/src/model/IUniversePath";
import { transformMatrix } from "./utils/transformMatrix";
import { FormantColors } from "./utils/FormantColors";

interface ILocalPathProps extends IUniverseLayerProps {
  dataSource?: UniverseTelemetrySource;
  pathWidth: number;
}

export const PathLayer = (props: ILocalPathProps) => {
  const { dataSource, pathWidth } = props;
  const universeData = useContext(UniverseDataContext);
  const layerData = useContext(LayerContext);
  const [obj, setObj] = useState(new THREE.Mesh());
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

        const points = positions.map(
          (pos) => new THREE.Vector3(pos.x, pos.y, pos.z)
        );

        const w = pathWidth > 10 ? 10 : pathWidth < 1 ? 1 : pathWidth;

        const curve = new THREE.CatmullRomCurve3(points);
        const pathGeometry = new THREE.TubeGeometry(
          curve,
          20,
          (0.01 / 2) * w,
          8
        );
        const pathMaterial = new THREE.MeshBasicMaterial();
        pathMaterial.color = new THREE.Color(FormantColors.blue);
        const pathMesh = new THREE.Mesh(pathGeometry, pathMaterial);
        pathMesh.matrixAutoUpdate = false;
        pathMesh.matrix.copy(worldToLocalMatrix);

        setObj(pathMesh);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [layerData, universeData, setObj]);

  return (
    <DataVisualizationLayer {...props} iconUrl="icons/3d_object.svg">
      <primitive object={obj} />
    </DataVisualizationLayer>
  );
};
