import { StreamType } from "@formant/data-sdk";
import { Positioning } from "../common/Positioning";

export class PositioningBuilder {
  static fixed(x: number, y: number, z: number): Positioning {
    return { type: "cartesian", x, y, z };
  }

  static odometry(
    stream: string,
    rtcStream?: string,
    useLatestDataPoint?: boolean,
    localizationWorldToLocal?: boolean
  ): Positioning {
    return {
      type: "odometry",
      stream,
      rtcStream,
      useLatestDataPoint,
      useWorldToLocalTransform: localizationWorldToLocal,
    };
  }

  static gps(
    stream: string,
    relativeLongLat: { long: number; lat: number }
  ): Positioning {
    return {
      type: "gps",
      stream,
      relativeToLatitude: relativeLongLat.lat,
      relativeToLongitude: relativeLongLat.long,
    };
  }

  static tranformTree(stream: string, end: string): Positioning {
    return {
      type: "transform tree",
      stream,
      end,
    };
  }
}
