import { useContext, useEffect, useRef } from "react";
import { IUniverseLayerProps } from "./types";
import { UniverseDataContext } from "./common/UniverseDataContext";
import { LayerContext } from "./common/LayerContext";
import { DataVisualizationLayer } from "./DataVisualizationLayer";
import {
  IUniverseGridMap,
  ITransform,
  UniverseTelemetrySource,
} from "@formant/universe-core";

import {
  CanvasTexture,
  Matrix4,
  MeshBasicMaterial,
  NearestFilter,
  Quaternion,
  Vector3,
} from "three";
import { IQuaternion, IVector3 } from "@formant/data-sdk";
import { useThree } from "@react-three/fiber";
import { FormantColors } from "./utils/FormantColors";

interface IPointOccupancyGridProps extends IUniverseLayerProps {
  dataSource?: UniverseTelemetrySource;
}

export const OccupancyGridLayer = (props: IPointOccupancyGridProps) => {
  const { dataSource } = props;
  const universeData = useContext(UniverseDataContext);
  const layerData = useContext(LayerContext);

  const meshRef = useRef<THREE.Mesh>(null!);
  const { camera } = useThree();
  camera.position.set(0, 5, 0);

  useEffect(() => {
    let mesh = meshRef.current;

    const timer = window.setTimeout(() => {
      mesh = meshRef.current;
    }, 1000);

    if (!layerData || !dataSource) return;

    const { deviceId } = layerData;

    dataSource.streamType = "localization";

    if (!mesh) return;

    const unsubscribe = universeData.subscribeToGridMap(
      deviceId,
      dataSource,
      (gridData: Symbol | IUniverseGridMap) => {
        if (typeof gridData === "symbol") {
          throw new Error("unhandled data status");
        }

        const { origin, width, height, resolution } =
          gridData as IUniverseGridMap;

        if (!mesh) return;

        mesh.matrixAutoUpdate = false;

        console.log(origin);

        mesh.matrix.copy(
          transformMatrix(origin).multiply(
            new Matrix4().makeScale(width * resolution, height * resolution, 1)
          )
        );

        const oldMat = mesh.material as MeshBasicMaterial;

        mesh.material = new MeshBasicMaterial({
          map: createTexture(gridData as IUniverseGridMap),
          transparent: true,
          opacity: 0.5,
        });

        oldMat.dispose();
      }
    );

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, [layerData, universeData, meshRef]);

  return (
    <DataVisualizationLayer {...props} iconUrl="../icons/3d_object.svg">
      <mesh ref={meshRef}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color={"#4e5a80"} />
      </mesh>
    </DataVisualizationLayer>
  );
};

function createTexture({ width, height, data }: IUniverseGridMap) {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d")!;

  const { mapColor, occupiedColor } = FormantColors;

  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      ctx.fillStyle = data[i * width + j] > 0 ? mapColor : occupiedColor;
      ctx.fillRect(i, j, 1, 1);
    }
  }
  const texture = new CanvasTexture(canvas);
  texture.flipY = false;
  texture.magFilter = NearestFilter;
  texture.minFilter = NearestFilter;
  texture.anisotropy = 16;

  return texture;
}

function transformMatrix({ translation, rotation }: ITransform): Matrix4 {
  const vector = ({ x, y, z }: IVector3) => new Vector3(x, y, z);
  const quaternion = ({ x, y, z, w }: IQuaternion) =>
    new Quaternion(x, y, z, w);
  return new Matrix4()
    .multiply(new Matrix4().setPosition(vector(translation)))
    .multiply(new Matrix4().makeRotationFromQuaternion(quaternion(rotation)));
}
