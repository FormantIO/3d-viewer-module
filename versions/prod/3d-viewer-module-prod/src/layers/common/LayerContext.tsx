import { IUniverseData } from "@formant/universe-core";
import React from "react";
import { EmptyUniverseData } from "./EmptyUniverseData";
import { Device } from "@formant/data-sdk";

export type LayerDeviceContext = {
  deviceId: string;
};

export const LayerContext = React.createContext<LayerDeviceContext | null>(
  null
);
