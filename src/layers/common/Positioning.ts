export type Positioning =
  | {
      type: "fixed";
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
      rtcStream?: string;
    }
  | {
      type: "gps";
      stream: string;
      relativeToLongitude: number;
      relativeToLatitude: number;
    };
