import { IUniverseData } from "@formant/universe-core";
import React from "react";
import { EmptyUniverseData } from "./EmptyUniverseData";

export const UniverseData = React.createContext<IUniverseData>(
  new EmptyUniverseData()
);
