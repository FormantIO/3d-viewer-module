import { Fleet } from "@formant/data-sdk";
import {
  defined,
  definedAndNotNull,
  UniverseTelemetrySource,
} from "@formant/universe-core";
import { computeDestinationPoint } from "geolib";
import { useContext, useEffect, useState } from "react";
import { Texture } from "three";
import { LayerDataContext } from "./common/LayerDataContext";
import { DataVisualizationLayer } from "./DataVisualizationLayer";
import { IUniverseLayerProps } from "./types";
import { loadTexture } from "./utils/loadTexture";
import { LayerType } from "./common/LayerTypes";

const URL_SCOPED_TOKEN = "pk.eyJ1IjoiYWJyYWhhbS1mb3JtYW50IiwiYSI6ImNrOWVuazlhbTAwdDYza203b2tybGZmNDMifQ.Ro6iNGYgvpDO4i6dcxeDGg";

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
  mapBoxKey: string;
}

export function MapLayer(props: IMapLayer) {
  const { dataSource, size, latitude, longitude, mapType, mapBoxKey } = props;
  const { children } = props;
  const layerData = useContext(LayerDataContext);
  const [mapTexture, setMapTexture] = useState<Texture | undefined>();

  useEffect(() => {
    (async () => {
      let location: [number, number];
      if (dataSource) {
        const device = await Fleet.getDevice(
          definedAndNotNull(layerData).deviceId
        );
        const results = await device.getTelemetry(
          defined(dataSource).streamName,
          new Date(Date.now() - 10000),
          new Date()
        );
        location = [
          Number(results[0].points[0][1].longitude),
          Number(results[0].points[0][1].latitude),
        ];
      } else {
        location = [Number(longitude), Number(latitude)];
      }

      const mapBoxConfig = {
        username: "mapbox",
        styleId: mapStyles[mapType],
        width: 1280,
        height: 1280,
        bearing: 0,
        accessToken: definedAndNotNull(mapBoxKey) || URL_SCOPED_TOKEN,
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

      setMapTexture(
        await loadTexture(
          `https://api.mapbox.com/styles/v1/${username}/${styleId}/static/[${minLongitude},${minLatitude},${maxLongitude},${maxLatitude}]/${width}x${height}@2x?logo=false&access_token=${accessToken}`
        )
      );
    })();
  }, []);
  const mapReady = mapTexture !== undefined;
  return (
    <DataVisualizationLayer {...props} type={LayerType.MAP}>
      {mapReady && (
        <mesh>
          <planeGeometry attach="geometry" args={[size, size]} />
          <meshStandardMaterial map={mapTexture} />
        </mesh>
      )}
      {children}
    </DataVisualizationLayer>
  );
}
