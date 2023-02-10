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
  (config.devices || []).forEach((device, di) => {
    mapLayers = (device.mapLayers || []).map((layer, i) => {
      const positioning = layer.positioning
        ? parsePositioning(layer.positioning)
        : PositioningBuilder.fixed(0, 0, 0);
      if (layer.mapType === "Ground Plane") {
        return (
          <GroundLayer
            key={"map" + i}
            positioning={positioning}
            treePath={getTreePath()}
            name={layer.mapName || "Ground Plane"}
          />
        );
      }
      // Portland long lat
      const defaultLong = "-122.6765";
      const defaultLat = "45.5231";

      const dataSource = layer.dataSource && parseDataSource(layer.dataSource);
      return (
        <MapLayer
          key={"map" + i}
          positioning={positioning}
          mapType={layer.worldMapType || "Satellite"}
          size={parseFloat(layer.mapSize || "200")}
          latitude={parseFloat(layer.latitude || defaultLat)}
          longitude={parseFloat(layer.longitude || defaultLong)}
          mapBoxKey={layer.mapboxKey || ""}
          dataSource={dataSource as UniverseTelemetrySource}
          name={layer.mapName || "Map"}
          treePath={getTreePath()}
        />
      );
    });
    (device.deviceVisualLayers || []).forEach((layer, i) => {
      const positioning = layer.positioning
        ? parsePositioning(layer.positioning)
        : PositioningBuilder.fixed(0, 0, 0);
      const dataSource = layer.dataSource && parseDataSource(layer.dataSource);
      if (layer.visualType === "Circle") {
        deviceLayers.push(
          <MarkerLayer
            key={"vis" + i}
            positioning={positioning}
            treePath={getTreePath()}
            name={layer.name || "Marker"}
          />
        );
      }
    });
    (device.pointCloudLayers || []).forEach((layer, i) => {
      const dataSource = layer.dataSource && parseDataSource(layer.dataSource);
      deviceLayers.push(
        <PointCloudLayer
          key={"pointcloud" + i}
          dataSource={dataSource as UniverseTelemetrySource | undefined}
          treePath={getTreePath()}
          name={layer.name || "Point Cloud"}
        />
      );
    });
    (device.geometryLayers || []).forEach((layer, i) => {
      const positioning = layer.positioning
        ? parsePositioning(layer.positioning)
        : PositioningBuilder.fixed(0, 0, 0);
      const dataSource = layer.dataSource && parseDataSource(layer.dataSource);
      if (dataSource) {
        deviceLayers.push(
          <GeometryLayer
            key={"geo" + i}
            positioning={positioning}
            dataSource={dataSource as UniverseTelemetrySource}
            treePath={getTreePath()}
            name={layer.name || "Geometry"}
          />
        );
      }
    });
    devices.push(
      <LayerContext.Provider
        key={"data" + di}
        value={{
          deviceId: definedAndNotNull(currentDeviceId),
        }}
      >
        <EmptyLayer
          name={device.name}
          id={currentDeviceId || undefined}
          treePath={[devices.length]}
        >
          {mapLayers}
          {deviceLayers}
        </EmptyLayer>
      </LayerContext.Provider>
    );
    deviceLayers = [];
  });
  return devices;
}
