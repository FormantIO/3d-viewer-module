import { UniverseDataSource } from "@formant/universe-core";
import { DataSourceBuilder } from "./layers/utils/DataSourceBuilder";
import { Positioning } from "./layers/common/Positioning";
import { PositioningBuilder } from "./layers/utils/PositioningBuilder";
import { PathType, PROPERTY_TYPE } from "./layers/types";

export type Viewer3DConfiguarationTransform = {
  transformType?: "Cartesian" | "GPS" | "Odometry" | "Transform tree";
  transformX?: number;
  transformY?: number;
  transformZ?: number;
  transformRelativeLatitude?: number;
  transformRelativeLongitude?: number;
  transformGpsStream?: string;
  transformLocalizationStream?: string;
  transformLocalizationLatestDataPoint?: boolean;
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
    | "Position indicator"
    | "Marker array"
    | "Point cloud"
    | "Path"
    | "Mission Planning"
    | "Image"
    | "GLTF"
    | "Points of interest";
  positionIndicatorUseURDF?: boolean;
  jointStateTelemetryStreamName?: string;
  geometryAllowTransparency?: boolean;
  realtimeJointStateStream?: string;
  markerSize?: number;
  markerSizeType?: "dynamic" | "static";
  pointCloudDecayTime?: number;
  pointCloudUseColors?: boolean;
  pathOpacity?: number;
  pathType?: PathType;
  pathWidth?: number;
  imageFileId?: string;
  imageWidth?: number;
  imageHeight?: number;
  gltfFileId?: string;
  gltfScale?: number;
} & Viewer3DConfiguarationTransform &
  Viewer3DConfigurationDataSource;

export type Viewer3DMap = {
  name?: string;
  mapType?: "GPS" | "Occupancy";
  gpsMapType?: "Satellite" | "Street" | "Satellite street";
  gpsMapSize: string;
  gpsMapLongitude?: number;
  gpsMapLatitude?: number;
} & Viewer3DConfiguarationTransform &
  Viewer3DConfigurationDataSource;

export type WaypointPropertyType = {
  propertyName: string;
  propertyType: PROPERTY_TYPE;
  min?: number;
  max?: number;
  floatDefault?: string;
  stringDefault?: string;
  integerDefault?: string;
  booleanDefault?: boolean;
  enumDefault?: string;
  enumLists?: { enumList: string }[];
};
export type Viewer3DMission = {
  commandName: string;
  pathType: PathType;
  pathWidth: number;
  waypointProperties: WaypointPropertyType[];
};

export interface IAdvanceOptions {
  useTimeline?: boolean;
  showGround?: boolean;
}

export type Viewer3DConfiguration = {
  advanceOptions?: IAdvanceOptions;
  maps: Viewer3DMap[];
  visualizations: Viewer3DVisualization[];
  missionPlanning?: Viewer3DMission[];
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

export function getRealtimeJointStateDataSource(
  vizLayer: Viewer3DVisualization
): UniverseDataSource | undefined {
  if (vizLayer.realtimeJointStateStream) {
    return DataSourceBuilder.realtime(
      vizLayer.realtimeJointStateStream,
      "json"
    );
  }

  return undefined;
}

export function getTeletryJointStateDataSource(
  vizLayer: Viewer3DVisualization
): UniverseDataSource | undefined {
  if (vizLayer.jointStateTelemetryStreamName) {
    return DataSourceBuilder.telemetry(
      vizLayer.jointStateTelemetryStreamName,
      "json"
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
    case "GPS":
      return PositioningBuilder.gps(positioning.transformGpsStream || "", {
        long: positioning.transformRelativeLongitude || 0,
        lat: positioning.transformRelativeLatitude || 0,
      });
    case "Odometry":
      return PositioningBuilder.odometry(
        positioning.transformLocalizationStream || "",
        positioning.transformLocalizationLatestDataPoint || false
      );
    case "Transform tree":
      return PositioningBuilder.tranformTree(
        positioning.transformTreeStream || "",
        positioning.transformTreeEndPoint || ""
      );
    default:
      return PositioningBuilder.fixed(0, 0, 0);
  }
}
