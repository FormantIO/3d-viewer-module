import {
  definedAndNotNull,
  UniverseTelemetrySource,
} from "@formant/universe-core";
import {
  parseDataSource,
  parsePositioning,
  Viewer3DConfiguration,
} from "./config";
import { LayerContext } from "./layers/common/LayerContext";
import EmptyLayer from "./layers/EmptyLayer";
import { GeometryLayer } from "./layers/GeometryLayer";
import { GroundLayer } from "./layers/GroundLayer";
import { MapLayer } from "./layers/MapLayer";
import { MarkerLayer } from "./layers/MarkerLayer";
import { PointCloudLayer } from "./layers/PointCloudLayer";
import { PositioningBuilder } from "./layers/utils/PositioningBuilder";
import getUuidByString from "uuid-by-string";
import { OccupancyGridLayer } from "./layers/OccupancyGridLayer";
import { PathLayer } from "./layers/PathLayer";
import { LayerType } from "./layers/common/LayerTypes";
import { cloneElement, isValidElement } from "react";

export function buildScene(
  config: Viewer3DConfiguration,
  currentDeviceId: string
): React.ReactNode {
  const devices: React.ReactNode[] = [];
  let deviceLayers: React.ReactNode[] = [];
  // add type to map Layers IUniverseLayerProps
  let mapLayers: JSX.Element[] = [];

  const configHash = getUuidByString(JSON.stringify(config));
  mapLayers = (config.maps || []).map((layer, i) => {
    const positioning = layer.transform
      ? parsePositioning(layer.transform)
      : PositioningBuilder.fixed(0, 0, 0 - (i + 1) * 0.005);
    if (layer.mapType === "Ground Plane") {
      return (
        <GroundLayer
          key={"ground" + i + configHash}
          positioning={positioning}
          treePath={[0, i]}
          name={layer.name || "Ground Plane"}
          type={LayerType.AXIS}
        />
      );
    } else if (layer.mapType === "GPS Map") {
      // Portland long lat
      const defaultLong = -122.6765;
      const defaultLat = 45.5231;

      const dataSource =
        layer.gpsMapDataSource && parseDataSource(layer.gpsMapDataSource);
      return (
        <MapLayer
          key={"map" + i + configHash}
          positioning={positioning}
          mapType={layer.gpsMapType || "Satellite"}
          size={layer.gpsMapSize || 200}
          latitude={layer.gpsMapLatitude || defaultLat}
          longitude={layer.gpsMapLongitude || defaultLong}
          dataSource={dataSource as UniverseTelemetrySource}
          name={layer.name || "Map"}
          treePath={[0, i]}
        />
      );
    } else if (layer.mapType === "Occupancy Map") {
      const dataSource =
        layer.occupancyMapDataSource &&
        parseDataSource(layer.occupancyMapDataSource);
      return (
        <OccupancyGridLayer
          key={"occupancy_grid" + i + configHash}
          dataSource={dataSource as UniverseTelemetrySource | undefined}
          treePath={[0, i]}
          name={layer.name || "Occupancy Grid"}
        />
      );
    }
    throw new Error("Unknown map type");
  });
  (config.visualizations || []).forEach((layer, i) => {
    if (layer.visualizationType === "Position Indicator") {
      const positioning = layer.transform
        ? parsePositioning(layer.transform)
        : PositioningBuilder.fixed(0, 0, 0);
      if (layer.positionIndicatorVisualType === "Circle") {
        deviceLayers.push(
          <MarkerLayer
            key={"vis" + i + configHash}
            positioning={positioning}
            treePath={[1, i]}
            name={layer.name || "Marker"}
          />
        );
      }
    } else if (layer.visualizationType === "Path") {
      const dataSource =
        layer.pathDataSource && parseDataSource(layer.pathDataSource);
      deviceLayers.push(
        <PathLayer
          key={"local_path_layer" + i + configHash}
          dataSource={dataSource as UniverseTelemetrySource | undefined}
          treePath={[1, i]}
          name={layer.name || "Local Path "}
        />
      );
    } else if (layer.visualizationType === "Point Cloud") {
      const dataSource =
        layer.pointCloudDataSource &&
        parseDataSource(layer.pointCloudDataSource);
      const { pointCloudDecayTime } = layer;
      deviceLayers.push(
        <PointCloudLayer
          key={"pointcloud" + i + configHash}
          dataSource={dataSource as UniverseTelemetrySource | undefined}
          treePath={[1, i]}
          name={layer.name || "Point Cloud"}
          decayTime={pointCloudDecayTime || 1}
        />
      );
    } else if (layer.visualizationType === "Geometry") {
      const positioning = layer.transform
        ? parsePositioning(layer.transform)
        : PositioningBuilder.fixed(0, 0, 0);
      const dataSource =
        layer.geometryDataSource && parseDataSource(layer.geometryDataSource);
      if (dataSource) {
        deviceLayers.push(
          <GeometryLayer
            key={"geo" + i + configHash}
            positioning={positioning}
            dataSource={dataSource as UniverseTelemetrySource}
            treePath={[1, i]}
            name={layer.name || "Geometry"}
          />
        );
      }
    } else {
      throw new Error("Unknown visualization type");
    }
  });

  // first map layer that isnt a ground plane is visible, others are hidden, except for the ground plane
  let firstMapLayer = true;
  mapLayers = mapLayers.map((layer) => {
    if (firstMapLayer && layer.props.type !== LayerType.AXIS) {
      firstMapLayer = false;
      return cloneElement(layer, { visible: true });
    } else if (layer.props.type === LayerType.AXIS) {
      return cloneElement(layer, { visible: true });
    } else {
      return cloneElement(layer, { visible: false });
    }
  });

  devices.push(
    <LayerContext.Provider
      key={"maps"}
      value={{
        deviceId: definedAndNotNull(currentDeviceId),
      }}
    >
      <EmptyLayer name={"Maps"} treePath={[0]}>
        {mapLayers}
      </EmptyLayer>
    </LayerContext.Provider>
  );
  devices.push(
    <LayerContext.Provider
      key={"visualizations"}
      value={{
        deviceId: definedAndNotNull(currentDeviceId),
      }}
    >
      <EmptyLayer name={"Visualizations"} treePath={[1]}>
        {deviceLayers}
      </EmptyLayer>
    </LayerContext.Provider>
  );
  deviceLayers = [];
  return devices;
}
