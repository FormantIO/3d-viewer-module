import { StreamType } from "@formant/data-sdk";
import * as uuid from "uuid";
import { DataSource, UniverseTelemetrySource } from "./DataSource";

export class DataSourceBuilder {
  static telemetry(
    streamName: string,
    streamType: StreamType
  ): UniverseTelemetrySource {
    return {
      id: uuid.v4(),
      sourceType: "telemetry",
      streamName,
      streamType,
    };
  }
}
