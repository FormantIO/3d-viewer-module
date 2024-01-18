import { Universe } from "./layers/common/Universe";
import { UniverseDataContext } from "./layers/common/UniverseDataContext";
import { useCallback, useEffect, useState } from "react";
import { Authentication, App as FormantApp } from "@formant/data-sdk";
import { Viewer3DConfiguration } from "./config";
import { definedAndNotNull, IUniverseData } from "@formant/universe-connector";
import {
  LiveUniverseData,
  TelemetryUniverseData,
} from "@formant/universe-connector";
import { MissingConfig } from "./components/MissingConfig";
import { buildScene } from "./buildScene";
import getUuidByString from "uuid-by-string";

const query = new URLSearchParams(window.location.search);
const currentDeviceId = query.get("device");

export function Viewer() {
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [configuration, setConfiguration] = useState<
    Viewer3DConfiguration | undefined
  >();
  const [universeData] = useState<IUniverseData>(
    () => new TelemetryUniverseData()
  );
  const [liveUniverseData] = useState<IUniverseData>(
    () => new LiveUniverseData()
  );
  useEffect(() => {
    (async () => {
      await Authentication.waitTilAuthenticated();
      const currentConfig = await FormantApp.getCurrentModuleConfiguration();
      if (currentConfig) {
        const parsedConfig = JSON.parse(currentConfig) as Viewer3DConfiguration;
        if (checkConfiguration(parsedConfig)) {
          setConfiguration(parsedConfig);
        }
      }
      setAuthenticated(true);

      FormantApp.addModuleConfigurationListener((config) => {
        const parsedConfig = JSON.parse(
          config.configuration
        ) as Viewer3DConfiguration;
        if (!checkConfiguration(parsedConfig)) {
          setConfiguration(undefined);
          return;
        }
        setConfiguration(parsedConfig);
      });
    })();
  }, []);

  useEffect(() => {
    if (!configuration) return;

    const { advanceOptions } = configuration;
    const useTimeline = advanceOptions?.useTimeline;

    if (useTimeline || useTimeline === undefined) {
      FormantApp.addModuleDataListener((event) => {
        const d = new Date(event.time);
        universeData.setTime(d);
      });
    } else {
      universeData.setTime("live");
    }
  }, [configuration]);

  const checkConfiguration = (config: Viewer3DConfiguration) => {
    if (
      (!config.maps || !config.maps.length) &&
      (!config.visualizations || !config.visualizations.length)
    )
      return false;
    return true;
  };

  const scene = useCallback(
    (config: Viewer3DConfiguration) => (
      <UniverseDataContext.Provider value={[universeData, liveUniverseData]}>
        <Universe
          configHash={getUuidByString(JSON.stringify(config))}
          key={getUuidByString(JSON.stringify(config))}
          config={config}
        >
          <group>
            <pointLight
              position={[1000, 1000, 1000]}
              color={"#18d2ff"}
              intensity={0.3 * 2.8}
              decay={0}
              distance={0}
            />
            <pointLight
              position={[-1000, -1000, 1000]}
              color={"#ea719d"}
              intensity={0.7 * 2.8}
              decay={0}
              distance={0}
            />
            <hemisphereLight
              intensity={0.2 * 2.8}
              color={"#f8f9fc"}
              groundColor={"#282f45"}
            />
          </group>
          {buildScene(config, definedAndNotNull(currentDeviceId))};
        </Universe>
      </UniverseDataContext.Provider>
    ),
    [universeData, currentDeviceId, configuration]
  );

  if (authenticated && configuration) {
    return scene(configuration);
  }
  if (authenticated && !configuration) return <MissingConfig />;
  return <div />;
}
