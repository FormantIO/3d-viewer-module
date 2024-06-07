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
} from "@formant/data-sdk";


import {
  ClampToEdgeWrapping,
  Color,
  CustomBlending,
  DataTexture,
  DoubleSide,
  LinearFilter,
  Matrix4,
  Mesh,
  NearestFilter,
  PlaneGeometry,
  RGBAFormat,
  ShaderMaterial,
  Texture,
  TextureLoader,
  Vector3,
} from "three";
import { FormantColors } from "./utils/FormantColors";
import { useBounds } from "./common/CustomBounds";

interface IPointOccupancyGridProps extends IUniverseLayerProps {
  dataSource?: UniverseTelemetrySource;
}

const mappedColor = defined(new Color(FormantColors.steel02));
const occupiedColor = defined(new Color(FormantColors.steel03));

const glColor = (c: Color) => {
  // I have NO IDEA why c.r, c.g, c.b are completely wrong, so im using hex
  const hex = c.getHex();
  const r = (hex >> 16) & 255;
  const g = (hex >> 8) & 255;
  const b = hex & 255;

  return `vec3(${r.toFixed(1)}/255.0, ${g.toFixed(1)}/255.0, ${b.toFixed(1)}/255.0)`;
}

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform sampler2D mapTexture;
varying vec2 vUv;

void main() {
   vec4 map = texture2D( mapTexture, vUv.xy );
    vec3 mappedColor = ${glColor(mappedColor)};
    //vec3 mappedColor = vec3(0.0, 0.0, 1.0);
    vec3 occupiedColor = ${glColor(occupiedColor)};
    float occupancy = smoothstep(0.5, 0.01, map.r);
    vec3 color = mix(mappedColor, occupiedColor, smoothstep(0.0, 1.0, occupancy));
    gl_FragColor = vec4(color, map.a);
}
`;


const createGridMaterial = () => {
  return new ShaderMaterial({
    blending: CustomBlending,
    depthTest: true,
    depthWrite: true,
    uniforms: {
      mapTexture: { value: new Texture() },
    },
    vertexShader,
    fragmentShader,
    side: DoubleSide,
  });
};

const createMesh = (material: ShaderMaterial) => {
  const mesh = new Mesh(new PlaneGeometry(1, 1), material);
  mesh.visible = false;
  mesh.up = new Vector3(0, 0, 1);
  return mesh;
};

export const OccupancyGridLayer = (props: IPointOccupancyGridProps) => {
  const { dataSource } = props;
  const [isReady, setIsReady] = useState(false);
  const [url, setUrl] = useState<string | undefined>(undefined);
  const [universeData, liveUniverseData] = useContext(UniverseDataContext);
  const layerData = useContext(LayerContext);
  const bounds = useBounds();

  const gridMat = useRef(createGridMaterial()).current;
  const mesh = useRef(createMesh(gridMat)).current;
  const obj = useRef(mesh);

  useEffect(() => {
    if (url) {
      const loader = new TextureLoader();
      loader.load(url, (texture) => {
        texture.generateMipmaps = false;
        texture.wrapS = ClampToEdgeWrapping;
        texture.wrapT = ClampToEdgeWrapping;
        texture.minFilter = LinearFilter;
        texture.magFilter = NearestFilter;


        gridMat.uniforms.mapTexture.value = texture;

        gridMat.needsUpdate = true;

        if (!mesh.visible) {
          setIsReady(true);
          obj.current.visible = true;
        }
      })
    }
  }, [url]);

  useEffect(() => {
    if (!layerData || !dataSource) return;

    const { deviceId } = layerData;
    dataSource.streamType = "localization";

    const unsubscribe = universeData.subscribeToGridMap(
      deviceId,
      dataSource,
      (gridData: Symbol | IUniverseGridMap) => {
        if (typeof gridData === "symbol") {
          return;
        }
        const {
          origin,
          width,
          height,
          resolution,
          data,
          worldToLocal,
          alpha,
          url: _url,
        } = gridData as IUniverseGridMap;

        const mesh = obj.current;
        mesh.matrixAutoUpdate = false;

        const _origin = {
          translation: {
            x: origin.translation.x + (width * resolution) / 2,
            y: origin.translation.y + (height * resolution) / 2,
            z: origin.translation.z - 0.01,
          },
          rotation: {
            x: origin.rotation.x,
            y: origin.rotation.y,
            z: origin.rotation.z,
            w: origin.rotation.w,
          }
        }

        const newMatrix = transformMatrix(_origin).multiply(
          new Matrix4().makeScale(width * resolution, height * resolution, 1)
        );
        if (worldToLocal) newMatrix.multiply(transformMatrix(worldToLocal));

        mesh.matrix.copy(newMatrix);
        mesh.updateMatrixWorld(true);


        if (_url) {
          // url is a primitive string, so setting the same value will not trigger a re-render, nor will it trigger the useEffect
          setUrl(_url);
          return;
        }
        if (!data) {
          return;
        }

        // if no url, fallback to the old method of creating the texture
        // this is slow and should be avoided
        const size = width * height;
        const textureData = new Uint8Array(4 * size);
        for (let i = 0; i < size; i++) {
          const value = data[i] * 255;
          textureData[i * 4] = value;
          textureData[i * 4 + 1] = value;
          textureData[i * 4 + 2] = value;
          textureData[i * 4 + 3] = alpha ? alpha[i] * 255 : 255;
        }

        // Create a new DataTexture and set its properties
        const texture = new DataTexture(textureData, width, height, RGBAFormat);
        texture.flipY = true;
        texture.needsUpdate = true;

        //convert dataTexture to texture
        texture.generateMipmaps = false;
        texture.wrapS = ClampToEdgeWrapping;
        texture.wrapT = ClampToEdgeWrapping;
        texture.minFilter = LinearFilter;
        texture.magFilter = NearestFilter;

        const actualTexture = texture as Texture;


        // Update the material with the new DataTexture and set other properties
        gridMat.uniforms.mapTexture.value = actualTexture;
        gridMat.opacity = 0.9;
        gridMat.depthTest = true;
        gridMat.needsUpdate = true;

        mesh.matrix.copy(newMatrix);
        mesh.updateMatrixWorld(true);


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
          <primitive object={obj.current} renderOrder={7} />
        </>
      )}
    </DataVisualizationLayer>
  );
};
