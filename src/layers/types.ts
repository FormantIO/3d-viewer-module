import { IUniverseData } from "@formant/universe-core";
import React from "react";
import { Positioning } from "../model/Positioning";

export interface IUniverseLayerProps {
  children?: React.ReactNode;
  positioning?: Positioning;
}
