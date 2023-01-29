import { StreamType } from "@formant/data-sdk";
import { UniverseDataSource } from "@formant/universe-core";
import * as uuid from "uuid";
import {
  DataSource,
  UniverseTelemetrySource,
  UniverseRosDataSource,
} from "./DataSource";

export class DataSourceBuilder {
  static telemetry(
    streamName: string,
    streamType: StreamType
  ): UniverseTelemetrySource {
    return {
      id: uuid.v4(),
      sourceType: "telemetry",
      streamName,
      streamType: streamType as any,
    };
  }

  static realtime(
    rosTopicName: string,
    rosTopicType: StreamType
  ): UniverseRosDataSource {
    return {
      id: uuid.v4(),
      sourceType: "realtime",
      rosTopicName,
      rosTopicType: rosTopicType as any,
    };
  }

  static hardware(rtcStreamName: string): UniverseDataSource {
    return {
      id: uuid.v4(),
      sourceType: "hardware",
      rtcStreamName,
    };
  }
}
