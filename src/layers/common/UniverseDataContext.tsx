import { IUniverseData } from "@formant/universe-connector";
import React from "react";
import { EmptyUniverseData } from "./EmptyUniverseData";

export const UniverseDataContext = React.createContext<
  [IUniverseData, IUniverseData]
>([new EmptyUniverseData(), new EmptyUniverseData()]);
