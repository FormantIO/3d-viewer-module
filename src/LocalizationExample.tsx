import { Universe } from "./layers/common/Universe";
import { UniverseDataContext } from "./layers/common/UniverseDataContext";
import { useCallback, useState } from "react";
import { Viewer3DConfiguration } from "./config";
import { definedAndNotNull, IUniverseData } from "@formant/universe-core";
import { TelemetryUniverseData } from "@formant/universe-connector";
import { buildScene } from "./buildScene";
import getUuidByString from "uuid-by-string";

const query = new URLSearchParams(window.location.search);
const currentDeviceId = query.get("device");

const newConfig: Viewer3DConfiguration = {
  maps: [
    {
      name: "ocupancy grid name",
      mapType: "Occupancy Map",
      occupancyMapDataSource: {
        telemetryStreamName: "Map", //replace with stream name
        telemetryStreamType: "localization",
        latestDataPoint: false,
      },
      transform: { localizationWorldToLocal: true },
    },
  ],
  visualizations: [
    {
      name: "device name",
      visualizationType: "Position Indicator",
      positionIndicatorVisualType: "Circle",

      transform: {
        localizationWorldToLocal: true,
        localizationStream: "Map", //replace with stream name
        positioningType: "Odometry",
      },
    },
  ],
};

export const Localization = () => {
  const [universeData] = useState<IUniverseData>(
    () => new TelemetryUniverseData()
  );

  const scene = useCallback(
    (config: Viewer3DConfiguration) => {
      return (
        <UniverseDataContext.Provider value={universeData}>
          <Universe configHash={getUuidByString(JSON.stringify(config))}>
            <ambientLight />
            {buildScene(config, definedAndNotNull(currentDeviceId))};
          </Universe>
        </UniverseDataContext.Provider>
      );
    },
    [universeData, currentDeviceId]
  );
  return scene(newConfig);
};