import {
  StreamType,
  UniverseDataSource,
  UniverseRosDataSource,
  UniverseTelemetrySource,
} from "@formant/data-sdk";
import * as uuid from "uuid";

export class DataSourceBuilder {
  static telemetry(
    streamName: string,
    streamType?: StreamType,
    latestDataPoint?: boolean
  ): UniverseTelemetrySource {
    return {
      id: uuid.v4(),
      sourceType: "telemetry",
      streamName,
      streamType,
      latestDataPoint,
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
