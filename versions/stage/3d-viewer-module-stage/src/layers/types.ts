import { IUniverseData } from "@formant/universe-core";
import React from "react";
import { Positioning } from "./common/Positioning";
import { LayerType } from "./common/LayerTypes";

export interface IUniverseLayerProps {
  visible?: boolean;
  children?: React.ReactNode | React.ReactNode[];
  positioning?: Positioning;
  name?: string;
  id?: string;
  type?: LayerType;
  treePath?: number[];
  iconUrl?: string;
}
