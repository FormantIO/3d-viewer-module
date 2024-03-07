import React from "react";

export type LayerDeviceContext = {
  deviceId: string;
};

export const LayerContext = React.createContext<LayerDeviceContext | null>(
  null
);
