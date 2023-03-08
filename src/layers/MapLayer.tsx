import { Fleet } from "@formant/data-sdk";
import {
  defined,
  definedAndNotNull,
  ILocation,
  UniverseTelemetrySource,
} from "@formant/universe-core";
import { computeDestinationPoint } from "geolib";
import { useContext, useEffect, useState } from "react";
import { Texture } from "three";
import { LayerContext } from "./common/LayerContext";
import { DataVisualizationLayer } from "./DataVisualizationLayer";
import { IUniverseLayerProps } from "./types";
import { loadTexture } from "./utils/loadTexture";
import { UniverseDataContext } from "./common/UniverseDataContext";

const URL_SCOPED_TOKEN =
  "pk.eyJ1IjoiYWJyYWhhbS1mb3JtYW50IiwiYSI6ImNrOWVuazlhbTAwdDYza203b2tybGZmNDMifQ.Ro6iNGYgvpDO4i6dcxeDGg";

const mapStyles = {
  Street: "streets-v11",
  Satellite: "satellite-v9",
  "Satellite Street": "satellite-streets-v11",
};
interface IMapLayer extends IUniverseLayerProps {
  dataSource?: UniverseTelemetrySource;
  latitude?: number;
  longitude?: number;
  size: number;
  mapType: "Street" | "Satellite" | "Satellite Street";
}

const defaultTexture = new Texture(
  new ImageData(1, 1)
);

export function MapLayer(props: IMapLayer) {
  const { dataSource, size, latitude, longitude, mapType } = props;
  const { children } = props;
  const universeData = useContext(UniverseDataContext);
  const layerData = useContext(LayerContext);
  const [mapTexture, setMapTexture] = useState<Texture>(
    new Texture()
  );
  const [mapTextures, setMapTextures] = useState<Texture[]>([]);

  const [currentLocation, setCurrentLocation] = useState<
    [number, number] | undefined
  >(undefined);

  useEffect(() => {
    (async () => {
      if (currentLocation === undefined) {
        return;
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
      const { username, styleId, width, height, accessToken } = mapBoxConfig;
      const distance = size / 2;
      // calculate bounding box, given center and distance
      const bearings = {
        north: 0,
        east: 90,
        south: 180,
        west: 270,
      };
      const EARTH_RADIUS_IN_METERS = 6371e3;
      const maxLatitude = computeDestinationPoint(
        location,
        distance,
        bearings.north,
        EARTH_RADIUS_IN_METERS
      ).latitude.toFixed(9);
      const minLatitude = computeDestinationPoint(
        location,
        distance,
        bearings.south,
        EARTH_RADIUS_IN_METERS
      ).latitude.toFixed(9);
      const maxLongitude = computeDestinationPoint(
        location,
        distance,
        bearings.east,
        EARTH_RADIUS_IN_METERS
      ).longitude.toFixed(9);
      const minLongitude = computeDestinationPoint(
        location,
        distance,
        bearings.west,
        EARTH_RADIUS_IN_METERS
      ).longitude.toFixed(9);

      const buildMapUrl = (imgRes: number, doubleRes: boolean) => {
        return `https://api.mapbox.com/styles/v1/${username}/${styleId}/static/[${minLongitude},${minLatitude},${maxLongitude},${maxLatitude}]/${imgRes}x${imgRes}${doubleRes ? '@2x' : ''}?logo=false&access_token=${accessToken}`;
      };
      const resolutions = [160, 320, 640, 1280];
      const textures: Texture[] = [];

      Promise.all(resolutions.map(async (res, index) => {
        const texture = await loadTexture(buildMapUrl(res, true));
        textures.push(texture);
        setMapTextures([...textures]);
      }));

    })();
  }, [currentLocation]);

  useEffect(() => {
    (async () => {
      let location: [number, number];
      if (dataSource) {
        dataSource.streamType = "location";
        universeData.subscribeToLocation(
          defined(layerData?.deviceId),
          dataSource,
          (data) => {
            if (typeof data === "symbol") return;
            const loc = data as ILocation;
            if (
              currentLocation === undefined ||
              (currentLocation && currentLocation[0] !== loc.longitude) ||
              currentLocation[1] !== loc.latitude
            ) {
              setCurrentLocation([loc.longitude, loc.latitude]);
            }
          }
        );
      } else {
        location = [Number(longitude), Number(latitude)];
        setCurrentLocation(location);
      }
    })();
  }, []);
  return (
    <DataVisualizationLayer {...props} iconUrl="icons/map.svg">
      <mesh>
        <planeGeometry attach="geometry" args={[size, size]} />
        <meshStandardMaterial map={mapTextures[mapTextures.length - 1] || new Texture()} />
      </mesh>
      {children}
    </DataVisualizationLayer>
  );
}
