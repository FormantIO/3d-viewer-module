import { Universe } from "./layers/common/Universe";
import { MarkerLayer } from "./layers/MarkerLayer";
import { UniverseDataContext } from "./layers/common/UniverseDataContext";
import { GeometryLayer } from "./layers/GeometryLayer";
import { PositioningBuilder } from "./layers/utils/PositioningBuilder";
import { GroundLayer } from "./layers/GroundLayer";
import { LayerDataContext } from "./layers/common/LayerDataContext";
import { MapLayer } from "./layers/MapLayer";
import { useEffect, useState } from "react";
import { Authentication, App as FormantApp } from "@formant/data-sdk";
import { parseDataSource, Viewer3DConfiguration } from "./config";
import * as uuid from "uuid";
import {
  definedAndNotNull,
  IUniverseData,
  UniverseTelemetrySource,
} from "@formant/universe-core";
import { parsePositioning } from "./config";
import { TelemetryUniverseData } from "@formant/universe-connector";
import EmptyLayer from "./layers/EmptyLayer";
import { MissingConfig } from "./components/MissingConfig";

const query = new URLSearchParams(window.location.search);
const currentDeviceId = query.get("device");

function buildScene(config: Viewer3DConfiguration): React.ReactNode {
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
      <LayerDataContext.Provider
        key={"data" + di}
        value={{
          deviceId: definedAndNotNull(currentDeviceId),
        }}
      >
        <EmptyLayer
          name={device.name}
          id={currentDeviceId || uuid.v4()}
          treePath={[devices.length]}
        >
          {mapLayers}
          {deviceLayers}
        </EmptyLayer>
      </LayerDataContext.Provider>
    );
    deviceLayers = [];
  });
  return devices;
}

export function Viewer() {
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [configuration, setConfiguration] = useState<
    Viewer3DConfiguration | undefined
  >();
  const [universeData] = useState<IUniverseData>(
    () => new TelemetryUniverseData()
  );
  useEffect(() => {
    (async () => {
      await Authentication.waitTilAuthenticated();
      setAuthenticated(true);
      const currentConfig = await FormantApp.getCurrentModuleConfiguration();
      if (currentConfig) {
        setConfiguration(JSON.parse(currentConfig) as Viewer3DConfiguration);
      }
      FormantApp.addModuleConfigurationListener((config) => {
        setConfiguration(
          JSON.parse(config.configuration) as Viewer3DConfiguration
        );
      });
      FormantApp.addModuleDataListener((event) => {
        const d = new Date(event.time);
        universeData.setTime(d);
      });
    })();
  }, []);
  if (authenticated && configuration) {
    return (
      <UniverseDataContext.Provider value={universeData}>
        <Universe>
          <ambientLight />
          {buildScene(configuration)};
        </Universe>
      </UniverseDataContext.Provider>
    );
  }
  if (authenticated && !configuration) return <MissingConfig />;
  return <div />;
}
