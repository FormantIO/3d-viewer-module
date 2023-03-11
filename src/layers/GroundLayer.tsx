import { useMemo } from "react";
import { Axis } from "./objects/Axis";
import { DataVisualizationLayer } from "./DataVisualizationLayer";
import { IUniverseLayerProps } from "./types";
import { AxisLabels } from "./objects/AxisLabels";
import { PolarGrid } from "./objects/PolarGrid";
interface IGroundLayer extends IUniverseLayerProps {
  flatAxis?: boolean;
}


export function GroundLayer(props: IGroundLayer) {
  const { children, flatAxis } = props;

  const axisLayers = useMemo(() => {
    return new AxisLabels(flatAxis || false);
  }, []);

  const polarGrid = useMemo(() => {
    return <PolarGrid />;
  }, []);

  return (
    <group name="axis">
      <DataVisualizationLayer {...props} iconUrl="icons/3d_object.svg">
        <Axis />
        <primitive object={axisLayers} />
        {polarGrid}
        {children}
      </DataVisualizationLayer>
    </group>

  );
}
