import { defined, UniverseTelemetrySource } from "@formant/data-sdk";
import React, { useContext, useEffect, useRef, useState } from "react";
import {
  Color,
  Mesh,
  MeshBasicMaterial,
  NearestFilter,
  PlaneGeometry,
  ShaderMaterial,
  sRGBEncoding,
  Texture,
} from "three";
import { LayerContext } from "./common/LayerContext";
import { DataVisualizationLayer } from "./DataVisualizationLayer";
import { IUniverseLayerProps } from "./types";
import { loadTexture } from "./utils/loadTexture";
import { UniverseDataContext } from "./common/UniverseDataContext";
import { extend, useFrame } from "@react-three/fiber";
import { useBounds } from "./common/CustomBounds";
import {
  getBoundingCoordinatesFromCenter,
  getGridCoordinates,
} from "./utils/MapUtils";
import { shaderMaterial } from "@react-three/drei";
import { ILocation } from "@formant/data-sdk";

const URL_SCOPED_TOKEN =
  "pk.eyJ1IjoiYWJyYWhhbS1mb3JtYW50IiwiYSI6ImNrOWVuazlhbTAwdDYza203b2tybGZmNDMifQ.Ro6iNGYgvpDO4i6dcxeDGg";

const mapStyles = {
  Street: "streets-v11",
  Satellite: "satellite-v9",
  "Satellite street": "satellite-streets-v11",
};
interface IMapLayer extends IUniverseLayerProps {
  dataSource?: UniverseTelemetrySource;
  latitude?: number;
  longitude?: number;
  size: number;
  mapType: "Street" | "Satellite" | "Satellite street";
}

const ColorShiftMaterial = shaderMaterial(
  { time: 0, color: new Color("#2D3855") },
  // vertex shader
  /*glsl*/ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // fragment shader
  /*glsl*/ `
    uniform float time;
    uniform vec3 color;
    varying vec2 vUv;
    void main() {
      gl_FragColor.rgba = vec4(0.05 * sin(vUv.yxx + time * 2.0) + color, 1.0);
    }
  `
);

extend({ ColorShiftMaterial });

export function MapLayer(props: IMapLayer) {
  const { dataSource, size, latitude, longitude, mapType } = props;
  const { children } = props;
  const [universeData, liveUniverseData] = useContext(UniverseDataContext);
  const layerData = useContext(LayerContext);

  const [currentLocation, setCurrentLocation] = useState<
    [number, number] | undefined
  >(undefined);
  const materialRef = useRef<any[]>([]);
  const meshesArrayRef = useRef<any[]>([]);
  const [gridCoordinates, setGridCoordinates] = useState<
    [number, number, number][]
  >([]);
  const bounds = useBounds();
  const lowResMapRef = useRef<any>(null);
  const [lowMapTextures, setLowMapTextures] = useState<Texture[]>([]);
  const shaderMaterialRef = useRef<ShaderMaterial>(null);
  const [highResLoaded, setHighResLoaded] = useState(false);
  const [unsubscribeToLocation, setUnsubscribeToLocation] = useState<
    (() => void) | null
  >(null);

  useEffect(() => {
    (async () => {
      if (currentLocation === undefined) {
        return;
      }
      unsubscribeToLocation && unsubscribeToLocation();

      if (bounds) {
        bounds.refresh().clip().fit();
      }
      const location = currentLocation;
      const mapBoxConfig = {
        username: "mapbox",
        styleId: mapStyles[mapType],
        width: 1280,
        height: 1280,
        bearing: 0,
        accessToken: URL_SCOPED_TOKEN,
      };
      const distance = 100;

      const buildMapUrl = (
        imgRes: number,
        doubleRes: boolean,
        coord?: [number, number, number]
      ) => {
        const { username, styleId, accessToken } = mapBoxConfig;
        // coord is the coordinate of the grid, if absent load the entire map
        const { minLatitude, maxLatitude, minLongitude, maxLongitude } =
          getBoundingCoordinatesFromCenter(
            location,
            coord ? distance : size / 2,
            coord ? [coord[0], coord[1]] : undefined
          );

        return `https://api.mapbox.com/styles/v1/${username}/${styleId}/static/[${minLongitude},${minLatitude},${maxLongitude},${maxLatitude}]/${imgRes}x${imgRes}${doubleRes ? "@2x" : ""
          }?logo=false&access_token=${accessToken}`;
      };

      // load multiple low res textures in order
      const resolutions = [160, 320, 640, 1280];
      const textures: Texture[] = [];

      Promise.all(
        resolutions.map(async (res, index) => {
          const texture = await loadTexture(
            buildMapUrl(res, index === resolutions.length - 1)
          );
          textures[index] = texture;
          setLowMapTextures([...textures]);
        })
      );

      // load all the high res textures
      await Promise.all(
        gridCoordinates.map(async (coord, i) => {
          const texture = await loadTexture(buildMapUrl(1280, true, coord));
          texture.encoding = sRGBEncoding;
          texture.magFilter = NearestFilter;
          texture.minFilter = NearestFilter;
          materialRef.current[i].map = texture;
          materialRef.current[i].color = new Color("#FFFFFF");
          materialRef.current[i].needsUpdate = true;
          return texture;
        })
      ).then(() => {
        setHighResLoaded(true);
      });
    })();
  }, [currentLocation]);

  useEffect(() => {
    (async () => {
      let location: [number, number];
      if (dataSource) {
        const unsubscribeToLocation = universeData.subscribeToLocation(
          defined(layerData?.deviceId),
          dataSource,
          (data) => {
            if (typeof data === "symbol") return;
            const loc = data as ILocation;
            if (
              currentLocation === undefined ||
              (currentLocation &&
                currentLocation[0] !== loc.longitude &&
                currentLocation[1] !== loc.latitude)
            ) {
              setCurrentLocation((a) => {
                if (
                  a !== undefined &&
                  a[0] === loc.longitude &&
                  a[1] === loc.latitude
                ) {
                  return a;
                }
                return [loc.longitude, loc.latitude];
              });
            }
          }
        );
        setUnsubscribeToLocation(() => unsubscribeToLocation);
      } else {
        location = [Number(longitude), Number(latitude)];
        setCurrentLocation(location);
      }
      const coordinates = getGridCoordinates(Math.ceil(size / 200) * 200, 200);
      setGridCoordinates(coordinates);
      materialRef.current = coordinates.map((coord, i) => {
        return new MeshBasicMaterial({
          map: null,
        });
      });
      const sharedPlaneGeometry = new PlaneGeometry(200, 200);
      meshesArrayRef.current = coordinates.map((coord, i) => {
        return (
          <mesh
            position={coord}
            key={JSON.stringify(coord)}
            geometry={sharedPlaneGeometry}
          >
            <meshBasicMaterial ref={(ref) => (materialRef.current[i] = ref)} />
          </mesh>
        );
      });
    })();
  }, []);

  useFrame(({ clock }) => {
    if (shaderMaterialRef.current && !highResLoaded) {
      const material = shaderMaterialRef.current;
      material.uniforms.time.value = clock.elapsedTime;
    }
  });

  return (
    <DataVisualizationLayer {...props} iconUrl="icons/map.svg">
      <group visible={highResLoaded}>{meshesArrayRef.current}</group>
      <mesh ref={lowResMapRef} visible={!highResLoaded}>
        <planeGeometry attach="geometry" args={[size, size]} />
        {lowMapTextures.length > 0 ? (
          <meshStandardMaterial
            map={lowMapTextures[lowMapTextures.length - 1]}
          />
        ) : (
          /* @ts-ignore -- extend() extends JSX but keeps giving TS warning */
          <colorShiftMaterial ref={shaderMaterialRef} />
        )}
      </mesh>

      {children}
    </DataVisualizationLayer>
  );
}
