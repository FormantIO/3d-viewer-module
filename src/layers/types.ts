import { IUniverseData } from "@formant/universe-core";
import React from "react";
import { Positioning } from "../model/SceneGraph";

export interface IUniverseLayerProps {
  children?: React.ReactNode;
  positioning?: Positioning;
}
