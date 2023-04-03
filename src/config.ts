import { StreamType, UniverseDataSource } from "@formant/universe-core";
import { DataSourceBuilder } from "./layers/utils/DataSourceBuilder";
import { Positioning } from "./layers/common/Positioning";
import { PositioningBuilder } from "./layers/utils/PositioningBuilder";

export type Viewer3DConfiguarationTransform = {
  transformType?: "Cartesian" | "Gps" | "Odometry" | "Transform Tree";
  transformX?: number;
  transformY?: number;
  transformZ?: number;
  transformRelativeLatitude?: number;
  transformRelativeLongitude?: number;
  transformGpsStream?: string;
  transformLocalizationStream?: string;
  transformLocalizationWorldToLocal?: boolean;
  transformLocalizationRealtimeStream?: string;
  transformTreeStream?: string;
  transformTreeEndPoint?: string;
};

export type Viewer3DConfigurationDataSource = {
  telemetryStreamName?: string;
  telemetryLatestDataPoint?: boolean;
};

export type Viewer3DVisualization = {
  name?: string;
  visualizationType?:
    | "Position Indicator"
    | "Geometry"
    | "Point Cloud"
    | "Path";
  positionIndicatorVisualType?: "Circle";
  markerSize?: number;
  markerSizeType?: "dynamic" | "static";
  pointCloudDecayTime?: number;
  pointCloudUseColors?: boolean;
  imageFileId?: string;
  imageWidth?: number;
  imageHeight?: number;
  gltfFileId?: string;
  gltfScale?: number;
} & Viewer3DConfiguarationTransform &
  Viewer3DConfigurationDataSource;

export type Viewer3DMap = {
  name?: string;
  mapType?: "Ground Plane" | "GPS Map" | "Occupancy Map";
  gpsMapType?: "Satellite" | "Street" | "Satellite Street";
  gpsMapSize: string;
  gpsMapLongitude?: number;
  gpsMapLatitude?: number;
} & Viewer3DConfiguarationTransform &
  Viewer3DConfigurationDataSource;

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
      undefined,
      dataSource.telemetryLatestDataPoint
    );
  }
  return undefined;
}

export function parsePositioning(
  positioning: Viewer3DConfiguarationTransform
): Positioning {
  switch (positioning.transformType) {
    case "Cartesian":
      return PositioningBuilder.fixed(
        positioning.transformX || 0,
        positioning.transformY || 0,
        positioning.transformZ || 0
      );
    case "Gps":
      return PositioningBuilder.gps(positioning.transformGpsStream || "", {
        long: positioning.transformRelativeLongitude || 0,
        lat: positioning.transformRelativeLatitude || 0,
      });
    case "Odometry":
      return PositioningBuilder.odometry(
        positioning.transformLocalizationStream || ""
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
