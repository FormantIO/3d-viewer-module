import { useContext, useEffect } from "react";
import { UIDataContext } from "../UIDataContext";
import { DataVisualizationLayer } from "./DataVisualizationLayer";
import { IUniverseLayerProps } from "./types";
import * as uuid from "uuid";

interface IEmptyLayer extends IUniverseLayerProps {}

const EmptyLayer = (props: IEmptyLayer) => {
  const { children, name, id, treePath } = props;

  return <DataVisualizationLayer {...props}>{children}</DataVisualizationLayer>;
};

export default EmptyLayer;
