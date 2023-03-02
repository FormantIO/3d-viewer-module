import { Authentication, App } from "@formant/data-sdk";
import { TelemetryUniverseData } from "@formant/universe-connector";
import { StreamType, UniverseDataSource } from "@formant/universe-core";
import { DataSourceBuilder } from "./layers/utils/DataSourceBuilder";
import { Positioning } from "./layers/common/Positioning";
import { PositioningBuilder } from "./layers/utils/PositioningBuilder";

// get query strings
const urlParams = new URLSearchParams(window.location.search);
const deviceId = urlParams.get("device") ?? undefined;

let schema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "3D viewer",
  type: "object",
  properties: {
    maps: {
      title: "Add maps",
      type: "array",
      items: {
        "$formant.itemName": "maps",
        type: "object",
        properties: {
          name: {
            type: "string",
            title: "Name",
          },
          mapType: {
            title: "Terrain type",
            type: "string",
            enum: ["Ground Plane", "GPS Map", "Occupancy Map"],
          },
          gpsMapType: {
            title: "World map type",
            type: "string",
            enum: ["Satellite", "Street", "Satellite Street"],
            default: "Satellite",
            "$formant.visible.when": ["mapType", "=", "GPS Map"],
          },
          gpsMapSize: {
            title: "Map edge length (meters)",
            type: "number",
            default: 1000,
            "$formant.visible.when": ["mapType", "=", "GPS Map"],
          },
          gpsMapDataSource: {
            type: "object",
            title: "Data source",
            properties: {
              telemetryStreamName: {
                type: "string",
                "$formant.streams.byType": "location",
              },
              latestDataPoint: {
                type: "boolean",
                default: false,
                description:
                  "Use latest data point in the last year, or the most recent data point within the last 15 seconds",
              },
            },
            "$formant.visible.when": ["mapType", "=", "GPS Map"],
          },
          gpsMaplongitude: {
            title: "Default longitude (optional)",
            type: "number",
            "$formant.visible.when": ["mapType", "=", "GPS Map"],
          },
          gpsMapLatitude: {
            title: "Default latitude (optional)",
            type: "number",
            "$formant.visible.when": ["mapType", "=", "GPS Map"],
          },
          occupancyMapDataSource: {
            type: "object",
            "$formant.visible.when": ["mapType", "=", "Occupancy Map"],
            properties: {
              telemetryStreamName: {
                type: "string",
                "$formant.streams.byType": "localization",
              },
              latestDataPoint: {
                type: "boolean",
                default: false,
                description:
                  "Use latest data point in the last year, or the most recent data point within the last 15 seconds",
              },
            },
          },
          transform: {
            title: "Transform",
            "$formant.itemName": "Transform",
            type: "object",
            properties: {
              positioningType: {
                type: "string",
                enum: ["Cartesian", "Gps", "Odometry", "Transform Tree"],
                default: "Cartesian",
              },
              x: {
                title: "X-axis",
                type: "number",
                "$formant.visible.when": ["positioningType", "=", "Cartesian"],
              },
              y: {
                title: "Y-axis",

                type: "number",
                "$formant.visible.when": ["positioningType", "=", "Cartesian"],
              },
              z: {
                title: "Z-axis",

                type: "number",
                "$formant.visible.when": ["positioningType", "=", "Cartesian"],
              },
              relativeLatitude: {
                type: "number",
                "$formant.visible.when": ["positioningType", "=", "Gps"],
              },
              relativeLongitude: {
                type: "number",
                "$formant.visible.when": ["positioningType", "=", "Gps"],
              },
              gpsStream: {
                type: "string",
                "$formant.streams.byType": "location",
                "$formant.visible.when": ["positioningType", "=", "Gps"],
              },
              localizationStream: {
                type: "string",
                "$formant.streams.byType": "localization",
                "$formant.visible.when": ["positioningType", "=", "Odometry"],
              },
              localizationWorldToLocal: {
                type: "boolean",
                default: true,
                "$formant.visible.when": ["positioningType", "=", "Odometry"],
              },
              localizationRealtimeStream: {
                type: "string",
                "$formant.visible.when": ["positioningType", "=", "Odometry"],
              },
              transformTreeStream: {
                type: "string",
                "$formant.streams.byType": "transform tree",
                "$formant.visible.when": [
                  "positioningType",
                  "=",
                  "Transform Tree",
                ],
              },
              transformTreeEndPoint: {
                type: "string",
                "$formant.visible.when": [
                  "positioningType",
                  "=",
                  "Transform Tree",
                ],
              },
            },
          },
        },
      },
    },
    visualizations: {
      title: "Add visualizations",
      type: "array",
      items: {
        type: "object",
        "$formant.itemName": "visualizations",
        properties: {
          name: {
            type: "string",
            title: "Name",
          },
          visualizationType: {
            type: "string",
            enum: ["Position Indicator", "Geometry", "Point Cloud", "Path"],
          },
          positionIndicatorVisualType: {
            type: "string",
            title: "Visual type",
            enum: ["Circle"],
            default: "Circle",
            "$formant.visible.when": [
              "visualizationType",
              "=",
              "Position Indicator",
            ],
          },
          geometryDataSource: {
            type: "object",
            title: "Data source",
            properties: {
              telemetryStreamName: {
                type: "string",
                "$formant.streams.byType": "json",
              },
              latestDataPoint: {
                type: "boolean",
                default: false,
                description:
                  "Use latest data point in the last year, or the most recent data point within the last 15 seconds",
              },
            },
            "$formant.visible.when": ["visualizationType", "=", "Geometry"],
          },
          pathDataSource: {
            type: "object",
            properties: {
              telemetryStreamName: {
                type: "string",
                "$formant.streams.byType": "localization",
              },
              latestDataPoint: {
                type: "boolean",
                default: false,
                description:
                  "Use latest data point in the last year, or the most recent data point within the last 15 seconds",
              },
            },
            "$formant.visible.when": ["visualizationType", "=", "Path"],
          },
          pointCloudSize: {
            type: "number",
            "$formant.visible.when": ["visualizationType", "=", "Point Cloud"],
          },
          pointCloudShape: {
            type: "string",
            default: "Circle",
            enum: ["Circle", "Rectangle"],
            "$formant.visible.when": ["visualizationType", "=", "Point Cloud"],
          },
          pointCloudDecayTime: {
            title: "Decay time",
            type: "number",
            "$formant.visible.when": ["visualizationType", "=", "Point Cloud"],
          },
          pointCloudColor1: {
            title: "Color 1",
            type: "string",
            "$formant.visible.when": ["visualizationType", "=", "Point Cloud"],
          },
          pointCloudColor2: {
            title: "Color 2",
            type: "string",
            "$formant.visible.when": ["visualizationType", "=", "Point Cloud"],
          },
          pointCloudDataSource: {
            title: "Data source",
            type: "object",
            properties: {
              telemetryStreamName: {
                type: "string",
                "$formant.streams.byType": "localization",
              },
              latestDataPoint: {
                type: "boolean",
                default: false,
                description:
                  "Use latest data point in the last year, or the most recent data point within the last 15 seconds",
              },
            },
            "$formant.visible.when": ["visualizationType", "=", "Point Cloud"],
          },
          transform: {
            title: "Transform",
            "$formant.itemName": "Transform",
            type: "object",
            properties: {
              positioningType: {
                type: "string",
                enum: ["Cartesian", "Gps", "Odometry", "Transform Tree"],
                default: "Cartesian",
              },
              x: {
                title: "X-axis",
                type: "number",
                "$formant.visible.when": ["positioningType", "=", "Cartesian"],
              },
              y: {
                title: "Y-axis",

                type: "number",
                "$formant.visible.when": ["positioningType", "=", "Cartesian"],
              },
              z: {
                title: "Z-axis",

                type: "number",
                "$formant.visible.when": ["positioningType", "=", "Cartesian"],
              },
              relativeLatitude: {
                type: "number",
                "$formant.visible.when": ["positioningType", "=", "Gps"],
              },
              relativeLongitude: {
                type: "number",
                "$formant.visible.when": ["positioningType", "=", "Gps"],
              },
              gpsStream: {
                type: "string",
                "$formant.streams.byType": "location",
                "$formant.visible.when": ["positioningType", "=", "Gps"],
              },
              localizationStream: {
                type: "string",
                "$formant.streams.byType": "localization",
                "$formant.visible.when": ["positioningType", "=", "Odometry"],
              },
              localizationWorldToLocal: {
                type: "boolean",
                default: true,
                "$formant.visible.when": ["positioningType", "=", "Odometry"],
              },
              localizationRealtimeStream: {
                type: "string",
                "$formant.visible.when": ["positioningType", "=", "Odometry"],
              },
              transformTreeStream: {
                type: "string",
                "$formant.streams.byType": "transform tree",
                "$formant.visible.when": [
                  "positioningType",
                  "=",
                  "Transform Tree",
                ],
              },
              transformTreeEndPoint: {
                type: "string",
                "$formant.visible.when": [
                  "positioningType",
                  "=",
                  "Transform Tree",
                ],
              },
            },
          },
        },
      },
    },
  },
};

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
  pointCloudShape?: "Circle" | "Square";
  pointCloudDecayTime?: number;
  pointCloudColor1?: String;
  pointCloudColor2?: String;
  pointCloudDataSource?: Viewer3DConfigurationDataSource;
};

export type Viewer3DMap = {
  name?: string;
  mapType?: "Ground Plane" | "GPS Map" | "Occupancy Map";
  gpsMapType?: "Satellite" | "Street" | "Satellite Street";
  gpsMapSize?: number;
  gpsMapDataSource?: Viewer3DConfigurationDataSource;
  gpsMaplongitude?: number;
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
