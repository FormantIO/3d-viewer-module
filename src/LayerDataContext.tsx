import { IUniverseData } from "@formant/universe-core";
import React from "react";
import { EmptyUniverseData } from "./EmptyUniverseData";
import { Device } from "@formant/data-sdk";

export type LayerDataDeviceContext = {
  deviceId: string;
};

export const LayerDataContext =
  React.createContext<LayerDataDeviceContext | null>(null);
