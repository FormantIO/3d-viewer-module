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

export function buildScene(
  config: Viewer3DConfiguration,
  currentDeviceId: string
): React.ReactNode {
  const devices: React.ReactNode[] = [];
  let deviceLayers: React.ReactNode[] = [];
  let mapLayers: React.ReactNode[] = [];
  const getTreePath = () => [
    devices.length,
    deviceLayers.length + mapLayers.length,
  ];
  const configHash = getUuidByString(JSON.stringify(config));
  mapLayers = (config.maps || []).map((layer, i) => {
    const positioning = layer.transform
      ? parsePositioning(layer.transform)
      : PositioningBuilder.fixed(0, 0, 0);
    if (layer.mapType === "Ground Plane") {
      return (
        <GroundLayer
          key={"ground" + i + configHash}
          positioning={positioning}
          treePath={getTreePath()}
          name={layer.name || "Ground Plane"}
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
          treePath={getTreePath()}
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
          treePath={getTreePath()}
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
            treePath={getTreePath()}
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
          treePath={getTreePath()}
          name={layer.name || "Local Path "}
        />
      );
    } else if (layer.visualizationType === "Point Cloud") {
      const dataSource =
        layer.pointCloudDataSource &&
        parseDataSource(layer.pointCloudDataSource);
      const {
        pointCloudShape: pointShape,
        pointCloudSize: pointSize,
        pointCloudDecayTime: decayTime,
        pointCloudColor1: color1,
        pointCloudColor2: color2,
      } = layer;
      deviceLayers.push(
        <PointCloudLayer
          key={"pointcloud" + i + configHash}
          dataSource={dataSource as UniverseTelemetrySource | undefined}
          treePath={getTreePath()}
          name={layer.name || "Point Cloud"}
          pointShape={pointShape || "Circle"}
          pointSize={pointSize || 0}
          decayTime={decayTime || 1}
          color1={color1 || "#729fda"}
          color2={color2 || "#F89973"}
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
            treePath={getTreePath()}
            name={layer.name || "Geometry"}
          />
        );
      }
    } else {
      throw new Error("Unknown visualization type");
    }
  });
  debugger;
  devices.push(
    <LayerContext.Provider
      key={"maps"}
      value={{
        deviceId: definedAndNotNull(currentDeviceId),
      }}
    >
      <EmptyLayer
        name={"Maps"}
        id={currentDeviceId || undefined}
        treePath={[devices.length]}
      >
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
      <EmptyLayer
        name={"Visualizations"}
        id={currentDeviceId || undefined}
        treePath={[devices.length]}
      >
        {deviceLayers}
      </EmptyLayer>
    </LayerContext.Provider>
  );
  deviceLayers = [];
  return devices;
}
