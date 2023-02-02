import { useContext, useEffect } from "react";
import { UIDataContext } from "./common/UIDataContext";
import { DataVisualizationLayer } from "./DataVisualizationLayer";
import { IUniverseLayerProps } from "./types";
import * as uuid from "uuid";
import { LayerType } from "./common/LayerTypes";

interface IEmptyLayer extends IUniverseLayerProps { }

const EmptyLayer = (props: IEmptyLayer) => {
    const { children, name, id, treePath, type } = props;

    return <DataVisualizationLayer {...props} type={type || LayerType.EMPTY} >{children}</DataVisualizationLayer>;
};

export default EmptyLayer;
