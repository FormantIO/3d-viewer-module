import { useContext, useEffect } from "react";
import { UIDataContext } from "../UIDataContext";
import { TransformLayer } from "./TransformLayer";
import { IUniverseLayerProps } from "./types";
import * as uuid from "uuid";

interface IEmptyLayer extends IUniverseLayerProps {}

const EmptyLayer = (props: IEmptyLayer) => {
  const { children, name, id, treePath } = props;

  return <TransformLayer {...props}>{children}</TransformLayer>;
};

export default EmptyLayer;
