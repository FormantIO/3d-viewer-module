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
  defined,
} from "@formant/universe-core";

import {
  Color,
  DataTexture,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  RGBAFormat,
  Vector3,
} from "three";
import { FormantColors } from "./utils/FormantColors";
import { useBounds } from "./common/CustomBounds";
import { smoothstep } from "three/src/math/MathUtils";

interface IPointOccupancyGridProps extends IUniverseLayerProps {
  dataSource?: UniverseTelemetrySource;
}

const mapColor = defined(new Color(FormantColors.mapColor));
const occupiedColor = defined(new Color(FormantColors.occupiedColor));
const createGridMaterial = () => {
  return new MeshBasicMaterial({
    transparent: true,
    opacity: 0.6,
    color: 0xffffff,
  });
};

const createMesh = (material: MeshBasicMaterial) => {
  const mesh = new Mesh(new PlaneGeometry(1, 1), material);
  mesh.visible = false;
  return mesh;
};

export const OccupancyGridLayer = (props: IPointOccupancyGridProps) => {
  const { dataSource } = props;
  const [isReady, setIsReady] = useState(false);
  const universeData = useContext(UniverseDataContext);
  const layerData = useContext(LayerContext);
  const bounds = useBounds();

  const gridMat = useRef(createGridMaterial()).current;
  const mesh = useRef(createMesh(gridMat)).current;
  const obj = useRef(mesh);

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
        const {
          origin,
          width,
          height,
          resolution,
          data,
          worldToLocal,
          canvas,
        } = gridData as IUniverseGridMap;
        if (isReady) return;
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
          const grayValue = data[i] / 255.0; // Normalize data value to the range [0, 1]
          const occupancy = smoothstep(grayValue, 0.01, 0.5); // Map the grayscale value to the range [0.01, 0.5]

          // Map the grayscale value to the formant colors
          const color = new Color();
          color.lerpColors(occupiedColor, mapColor, occupancy);

          // Set the color channels in the textureData
          textureData[stride] = Math.round(color.r * 255); // Red channel
          textureData[stride + 1] = Math.round(color.g * 255); // Green channel
          textureData[stride + 2] = Math.round(color.b * 255); // Blue channel
          textureData[stride + 3] = 255; // Alpha channel (fully opaque)

          if (pixelDataFromCanvas) {
            textureData[stride + 3] = pixelDataFromCanvas[stride + 3];
          }
        }

        // Create a new DataTexture and set its properties
        const texture = new DataTexture(textureData, width, height, RGBAFormat);
        texture.flipY = true;
        texture.needsUpdate = true;

        // Update the material with the new DataTexture and set other properties
        gridMat.map = texture;
        gridMat.needsUpdate = true;
        gridMat.opacity = 0.6;
        gridMat.depthTest = true;
        gridMat.color = new Color(0xffffff);

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
