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
}

export const PathLayer = (props: ILocalPathProps) => {
  const { dataSource } = props;
  const universeData = useContext(UniverseDataContext);
  const layerData = useContext(LayerContext);
  const [obj, setObj] = useState(new THREE.Group());

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

        const mesh = new THREE.InstancedMesh(
          new THREE.SphereGeometry(0.01),
          new THREE.MeshBasicMaterial({
            color: new THREE.Color(FormantColors.blue),
          }),
          positions.length
        );

        const tempMatrix = new THREE.Matrix4();
        positions.forEach((pos, idx) => {
          tempMatrix.setPosition(pos.x, pos.y, pos.z);
          mesh.setMatrixAt(idx, tempMatrix);
        });

        mesh.matrixAutoUpdate = false;

        const worldToLocalMatrix = transformMatrix(worldToLocal);
        mesh.matrix.copy(worldToLocalMatrix);

        const group = new THREE.Group();

        const points = positions.map(
          (pos) => new THREE.Vector3(pos.x, pos.y, pos.z)
        );
        const geo = new THREE.BufferGeometry().setFromPoints(points);

        const line = new THREE.Line(
          geo,
          new THREE.LineBasicMaterial({
            color: FormantColors.blue,
            linewidth: 2,
          })
        );
        line.matrixAutoUpdate = false;
        line.matrix.copy(worldToLocalMatrix);

        group.add(mesh, line);
        setObj(group);
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
