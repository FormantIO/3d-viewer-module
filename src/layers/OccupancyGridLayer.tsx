import {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { IUniverseLayerProps } from "./types";
import { UniverseDataContext } from "./common/UniverseDataContext";
import { LayerContext } from "./common/LayerContext";
import { DataVisualizationLayer } from "./DataVisualizationLayer";
import { transformMatrix } from "./utils/transformMatrix";
import {
  IUniverseGridMap,
  UniverseTelemetrySource,
} from "@formant/universe-core";

import {
  Color,
  DataTexture,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  Vector3,
} from "three";
import { FormantColors } from "./utils/FormantColors";
import { useBounds } from "./common/CustomBounds";

interface IPointOccupancyGridProps extends IUniverseLayerProps {
  dataSource?: UniverseTelemetrySource;
}

const convertColor = (c: string) => {
  const col = new Color(c);
  return [
    Math.floor(col.r * 255),
    Math.floor(col.g * 255),
    Math.floor(col.b * 255),
  ];
};
const mapColor = convertColor(FormantColors.mapColor);
const occupiedColor = convertColor(FormantColors.occupiedColor);

export const OccupancyGridLayer = (props: IPointOccupancyGridProps) => {
  const { dataSource } = props;
  const [isReady, setIsReady] = useState(false);
  const universeData = useContext(UniverseDataContext);
  const layerData = useContext(LayerContext);
  const bounds = useBounds();

  const gridMat = new MeshBasicMaterial({ transparent: true, opacity: 0.6 });
  const mesh = new Mesh(new PlaneGeometry(), gridMat);
  mesh.visible = false;

  const obj = useRef<Mesh>(mesh);

  useEffect(() => {
    if (!layerData || !dataSource) return;

    const { deviceId } = layerData;
    dataSource.streamType = "localization";

    const unsubscribe = universeData.subscribeToGridMap(
      deviceId,
      dataSource,
      (gridData: Symbol | IUniverseGridMap) => {
        if (typeof gridData === "symbol") {
          console.warn("empty data for grid");
          return;
        }
        console.log(gridData);
        const {
          origin,
          width,
          height,
          resolution,
          data,
          worldToLocal,
          canvas,
        } = gridData as IUniverseGridMap;

        const mesh = obj.current;
        mesh.matrixAutoUpdate = false;

        origin.translation.x += (width * resolution) / 2;
        origin.translation.y += (height * resolution) / 2;
        origin.translation.z -= 0.01;

        const newMatrix = transformMatrix(origin).multiply(
          new Matrix4().makeScale(width * resolution, height * resolution, 1)
        );
        if (worldToLocal) newMatrix.multiply(transformMatrix(worldToLocal));

        mesh.matrix.copy(newMatrix);

        const size = width * height;
        const textureData = new Uint8Array(4 * size);

        const pixelDataFromCanvas = (
          canvas && canvas.getContext("2d")
        )?.getImageData(0, 0, width, height).data;

        for (let i = 0; i < size; i++) {
          const stride = i * 4;
          textureData[stride] = data[i] > 0 ? mapColor[0] : occupiedColor[0];
          textureData[stride + 1] =
            data[i] > 0 ? mapColor[1] : occupiedColor[1];
          textureData[stride + 2] =
            data[i] > 0 ? mapColor[2] : occupiedColor[2];

          textureData[stride + 3] = 255; // alpha
          if (pixelDataFromCanvas) {
            textureData[stride + 3] = pixelDataFromCanvas[stride + 3];
          }
        }
        const texture = new DataTexture(textureData, width, height);
        texture.flipY = true;
        texture.needsUpdate = true;
        gridMat.map = texture;
        gridMat.needsUpdate = true;
        gridMat.opacity = 0.5;
        mesh.up = new Vector3(0, 0, 1);

        if (!mesh.visible && size) {
          setIsReady(true);
          obj.current.visible = true;
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [layerData, universeData]);

  useLayoutEffect(() => {
    if (isReady && bounds) {
      // send event to update bounds
      window.dispatchEvent(new Event("updateBounds"));
    }
  }, [isReady]);

  return (
    <DataVisualizationLayer {...props} iconUrl="icons/3d_object.svg">
      {isReady && (
        <>
          <primitive object={obj.current} />
        </>
      )}
    </DataVisualizationLayer>
  );
};
