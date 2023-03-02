import { Authentication, App } from "@formant/data-sdk";
import { TelemetryUniverseData } from "@formant/universe-connector";
import { StreamType, UniverseDataSource } from "@formant/universe-core";
import { DataSourceBuilder } from "./layers/utils/DataSourceBuilder";
import { Positioning } from "./layers/common/Positioning";
import { PositioningBuilder } from "./layers/utils/PositioningBuilder";

export type Viewer3DConfiguarationTransform = {
  positioningType?: "Cartesian" | "Gps" | "Odometry" | "Transform Tree";
  x?: number;
  y?: number;
  z?: number;
  relativeLatitude?: number;
  relativeLongitude?: number;
  gpsStream?: string;
  localizationStream?: string;
  localizationWorldToLocal?: boolean;
  localizationRealtimeStream?: string;
  transformTreeStream?: string;
  transformTreeEndPoint?: string;
};

export type Viewer3DConfigurationDataSource = {
  telemetryStreamName?: string;
  telemetryStreamType?: string;
  latestDataPoint?: boolean;
};

export type Viewer3DVisualization = {
  name?: string;
  visualizationType?:
    | "Position Indicator"
    | "Geometry"
    | "Point Cloud"
    | "Path";
  positionIndicatorVisualType?: "Circle";
  geometryDataSource?: Viewer3DConfigurationDataSource;
  pathDataSource?: Viewer3DConfigurationDataSource;
  pointCloudSize?: number;
  pointCloudShape?: "Circle" | "Rectangle";
  pointCloudDecayTime?: number;
  pointCloudColor1?: string;
  pointCloudColor2?: string;
  pointCloudDataSource?: Viewer3DConfigurationDataSource;
  transform?: Viewer3DConfiguarationTransform;
};

export type Viewer3DMap = {
  name?: string;
  mapType?: "Ground Plane" | "GPS Map" | "Occupancy Map";
  gpsMapType?: "Satellite" | "Street" | "Satellite Street";
  gpsMapSize?: number;
  gpsMapDataSource?: Viewer3DConfigurationDataSource;
  gpsMapLongitude?: number;
  gpsMapLatitude?: number;
  occupancyMapDataSource?: Viewer3DConfigurationDataSource;
  transform?: Viewer3DConfiguarationTransform;
};

export type Viewer3DConfiguration = {
  maps: Viewer3DMap[];
  visualizations: Viewer3DVisualization[];
};

export function parseDataSource(
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

export function parsePositioning(
  positioning: Viewer3DConfiguarationTransform
): Positioning {
  switch (positioning.positioningType) {
    case "Cartesian":
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
      return PositioningBuilder.odometry(positioning.localizationStream || "");
    case "Transform Tree":
      return PositioningBuilder.tranformTree(
        positioning.transformTreeStream || "",
        positioning.transformTreeEndPoint || ""
      );
    default:
      return PositioningBuilder.fixed(0, 0, 0);
  }
}
