import { StreamType } from "@formant/universe-core";

export type Positioning =
  | {
      type: "cartesian";
      x: number;
      y: number;
      z: number;
    }
  | {
      type: "transform tree";
      stream: string;
      end?: string;
    }
  | {
      type: "odometry";
      stream?: string;
      streamType: StreamType;
      rtcStream?: string;
      useWorldToLocalTransform?: boolean;
    }
  | {
      type: "gps";
      stream: string;
      relativeToLongitude: number;
      relativeToLatitude: number;
    };
