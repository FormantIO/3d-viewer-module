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
      useLatestDataPoint?: boolean;
      rtcStream?: string;
      useWorldToLocalTransform?: boolean;
    }
  | {
      type: "gps";
      stream: string;
      relativeToLongitude: number;
      relativeToLatitude: number;
    };
