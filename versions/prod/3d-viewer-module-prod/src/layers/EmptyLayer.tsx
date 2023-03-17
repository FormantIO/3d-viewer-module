import { LayerType } from "./common/LayerTypes";
import { DataVisualizationLayer } from "./DataVisualizationLayer";
import { IUniverseLayerProps } from "./types";

interface IEmptyLayer extends IUniverseLayerProps {}

const EmptyLayer = (props: IEmptyLayer) => {
  const { children, name, id, treePath, type } = props;

  return (
    <DataVisualizationLayer {...props} type={LayerType.CONTAINER}>
      {children}
    </DataVisualizationLayer>
  );
};

export default EmptyLayer;
