import { useContext, useEffect } from "react";
import { UIDataContext } from "../UIDataContext";
import { TransformLayer } from "./TransformLayer"
import { IUniverseLayerProps } from "./types"
import * as uuid from 'uuid';

interface IEmptyLayer extends IUniverseLayerProps { };

const EmptyLayer = (props: IEmptyLayer) => {
    const { children, name, id, treePath } = props;
    const { register, layers } = useContext(UIDataContext);

    useEffect(() => {
        register(name || 'Empty', id || uuid.v4(), treePath);
    }, [])

    const thisLayer = layers.find(layer => layer.id === id);

    return (
        <TransformLayer {...props} visible={thisLayer?.visible}>
            {children}
        </TransformLayer>
    );
}

export default EmptyLayer;