export type Positioning =
  | {
      type: "manual";
      x: number;
      y: number;
      z: number;
    }
  | {
      type: "hud";
      x: number;
      y: number;
    }
  | {
      type: "transform tree";
      stream?: string;
      end?: string;
    }
  | {
      type: "localization";
      stream?: string;
      rtcStream?: string;
    }
  | {
      type: "gps";
      stream?: string;
      relativeToLongitude: number;
      relativeToLatitude: number;
    };
