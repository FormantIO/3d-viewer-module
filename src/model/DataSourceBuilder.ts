import * as uuid from "uuid";
import { StreamType } from "@formant/universe-core";
import { DataSource } from "./DataSource";

export class DataSourceBuilder {
  static telemetry(streamName: string, streamType: StreamType): DataSource {
    return {
      id: uuid.v4(),
      sourceType: "telemetry",
      streamName,
      streamType,
    };
  }
}
