import { Authentication, App } from "@formant/data-sdk";
import { TelemetryUniverseData } from "@formant/universe-connector";
import { StreamType, UniverseDataSource } from "@formant/universe-core";
import { DataSourceBuilder } from "./model/DataSourceBuilder";
import { Positioning } from "./model/Positioning";
import { PositioningBuilder } from "./model/PositioningBuilder";

// get query strings
const urlParams = new URLSearchParams(window.location.search);
const deviceId = urlParams.get("device") ?? undefined;

export type Viewer3DConfiguarationPositioning = {
  positioningType?: "Fixed" | "Gps" | "Odometry" | "Transform Tree" | "Hud";
  x?: number;
  y?: number;
  z?: number;
  hudX?: number;
  hudY?: number;
  relativeLatitude?: number;
  relativeLongitude?: number;
  gpsStream?: string;
  localizationStream?: string;
  localizationRealtimeStream?: string;
  transformTreeStream?: string;
  transformTreeEndPoint?: string;
};

export type Viewer3DConfigurationDataSource = {
  telemetryStreamName?: string;
  telemetryStreamType?: string;
  latestDataPoint?: boolean;
};

export type Viewer3DConfiguration = {
  devices?: {
    name?: string;
    positioning?: Viewer3DConfiguarationPositioning;
    mapLayers?: {
      mapType?: "Ground Plane" | "World Map";
      worldMapType?: "Satellite" | "Street" | "Satellite Street";
      mapName?: string;
      mapSize?: string;
      longitude?: string;
      latitude?: string;
      mapboxKey?: string;
      dataSource?: Viewer3DConfigurationDataSource;
      positioning?: Viewer3DConfiguarationPositioning;
    }[];
    deviceVisualLayers?: {
      name?: string;
      visualType?: "Circle";
      dataSource?: Viewer3DConfigurationDataSource;
      positioning?: Viewer3DConfiguarationPositioning;
    }[];
    geometryLayers?: {
      name?: string;
      dataSource?: Viewer3DConfigurationDataSource;
      positioning?: Viewer3DConfiguarationPositioning;
    }[];
  }[];
};

function parseDataSource(
  dataSource: Viewer3DConfigurationDataSource
): UniverseDataSource | undefined {
  if (dataSource.telemetryStreamName) {
    return DataSourceBuilder.telemetry(
      dataSource.telemetryStreamName,
      (dataSource.telemetryStreamType as StreamType) || "json",
      dataSource.latestDataPoint
    );
  }
  return undefined;
}

function parsePositioning(
  positioning: Viewer3DConfiguarationPositioning
): Positioning {
  switch (positioning.positioningType) {
    case "Fixed":
      return PositioningBuilder.fixed(
        positioning.x || 0,
        positioning.y || 0,
        positioning.z || 0
      );
    case "Gps":
      return PositioningBuilder.gps(positioning.gpsStream || "", {
        long: positioning.relativeLongitude || 0,
        lat: positioning.relativeLatitude || 0,
      });
    case "Odometry":
      return PositioningBuilder.localization(
        positioning.localizationStream || ""
      );
    case "Transform Tree":
      return PositioningBuilder.tranformTree(
        positioning.transformTreeStream || "",
        positioning.transformTreeEndPoint || ""
      );
    default:
      return PositioningBuilder.fixed(0, 0, 0);
  }
}
