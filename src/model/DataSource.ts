import { StreamType } from "@formant/universe-core";

export interface UniverseRosDataSource {
  id: string;
  sourceType: "realtime";
  rosTopicName: string;
  rosTopicType: string;
}
export interface UniverseHardwareDataSource {
  id: string;
  sourceType: "hardware";
  rtcStreamName: string;
}
export interface UniverseTelemetrySource {
  id: string;
  sourceType: "telemetry";
  streamName: string;
  streamType: StreamType;
}
export declare type DataSource =
  | UniverseRosDataSource
  | UniverseTelemetrySource
  | UniverseHardwareDataSource;
