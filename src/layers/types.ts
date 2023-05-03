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

export enum PathType {
  STATIC = "Static",
  DYNAMIC = "Dynamic",
}

export enum PROPERTY_TYPE {
  FLOAT = "Float",
  INTEGER = "Integer",
  BOOLEAN = "Boolean",
  STRING = "String",
  ENUM = "Enum",
  MEATADATA = "Metadata",
}

export type INPUT_TYPE =
  | PROPERTY_TYPE.FLOAT
  | PROPERTY_TYPE.INTEGER
  | PROPERTY_TYPE.STRING
  | PROPERTY_TYPE.MEATADATA;

export enum SENDING_STATUS {
  NONE = "not sent yet",
  WAITING = "waiting",
  SUCCESS = "sucess",
  FAIL = "fail",
}
