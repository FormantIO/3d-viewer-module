import { UniverseTelemetrySource } from "@formant/universe-core";
import { useContext, useEffect, useMemo, useState } from "react";
import { DataVisualizationLayer } from "./DataVisualizationLayer";
import { IUniverseLayerProps } from "./types";
import { Label } from "./objects/Label";
import { UniverseDataContext } from "./common/UniverseDataContext";
import { LayerContext } from "./common/LayerContext";
import { defined } from "../common/defined";
// @ts-ignore
import jq from "jq-web";
import { parseColor } from "./utils/parseColor";
interface ILabelLayer extends IUniverseLayerProps {
  dataSource?: UniverseTelemetrySource;
  color?: string;
  textColor?: string;
  jsonQuery?: string;
  template?: string;
  value?: string;
  colorStates?: {
    [key: string]: {
      color: string;
      textColor: string;
    };
  };
}

export function LabelLayer(props: ILabelLayer) {
  const {
    dataSource,
    color,
    textColor,
    jsonQuery,
    template,
    value,
    colorStates,
  } = props;
  const [currentValue, setCurrentValue] = useState<string>(value || "");
  const [currentColor] = useState<string | undefined>(
    color ? parseColor(color) : undefined
  );
  const [currentTextColor] = useState<string | undefined>(
    textColor ? parseColor(textColor) : undefined
  );
  const universeData = useContext(UniverseDataContext);
  const layerContext = useContext(LayerContext);

  useEffect(() => {
    setCurrentValue(value || "");
  }, [value]);

  const label = useMemo(() => {
    let extractedValue = currentValue;
    if (
      dataSource?.sourceType === "telemetry" &&
      dataSource.streamType === "json" &&
      jsonQuery
    ) {
      try {
        extractedValue = jq.json(JSON.parse(currentValue), jsonQuery);
        if (typeof extractedValue === "string") {
          extractedValue = extractedValue;
        } else {
          extractedValue = JSON.stringify(extractedValue);
        }
      } catch (e) {
        console.error(e);
        extractedValue = "error parsing json";
      }
    }

    let evaluatedColor = currentColor;
    let evaluatedTextColor = currentTextColor;
    if (colorStates) {
      const colorState = colorStates[extractedValue];
      if (colorState) {
        evaluatedColor = colorState.color;
        evaluatedTextColor = colorState.textColor;
      }
    }
    const templatedValue = template
      ? template.replace("{}", extractedValue)
      : extractedValue;
    const label = new Label(
      templatedValue,
      false,
      evaluatedColor ? evaluatedColor : undefined,
      evaluatedTextColor ? evaluatedTextColor : undefined
    );
    return label;
  }, [colorStates, currentValue, color, jsonQuery, template]);

  useEffect(() => {
    if (dataSource?.sourceType === "telemetry") {
      if (dataSource.streamType === "json") {
        const unsub = universeData.subscribeToJson(
          defined(layerContext?.deviceId),
          dataSource,
          (data) => {
            if (typeof data === "symbol") return;
            setCurrentValue(data as string);
          }
        );
        return () => unsub();
      } else if (dataSource?.streamType === "text") {
        const unsub = universeData.subscribeToText(
          defined(layerContext?.deviceId),
          dataSource,
          (data) => {
            if (typeof data === "symbol") return;
            setCurrentValue(data as string);
          }
        );
        return () => unsub();
      }
    }
  }, [dataSource]);

  return (
    <DataVisualizationLayer {...props} iconUrl="../icons/3d_object.svg">
      <primitive object={label} />
    </DataVisualizationLayer>
  );
}
