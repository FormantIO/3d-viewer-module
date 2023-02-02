import { Positioning } from "../common/Positioning";

export class PositioningBuilder {
  static fixed(x: number, y: number, z: number): Positioning {
    return { type: "fixed", x, y, z };
  }

  static localization(stream: string): Positioning {
    return { type: "odometry", stream };
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
