import { Universe } from "./layers/common/Universe";
import { UniverseDataContext } from "./layers/common/UniverseDataContext";
import { useCallback, useEffect, useState } from "react";
import {
  Authentication,
  App as FormantApp,
  Fleet,
  Device,
} from "@formant/data-sdk";
import { Viewer3DConfiguration } from "./config";
import { definedAndNotNull, IUniverseData } from "@formant/universe-core";
import { TelemetryUniverseData } from "@formant/universe-connector";
import { MissingConfig } from "./components/MissingConfig";
import { buildScene } from "./buildScene";
import getUuidByString from "uuid-by-string";
import { DeviceContext } from "./layers/common/DeviceContext";

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
  const [device, setDevice] = useState<Device | null>(null);
  useEffect(() => {
    (async () => {
      await Authentication.waitTilAuthenticated();
      const _device = currentDeviceId
        ? await Fleet.getDevice(currentDeviceId)
        : null;
      setDevice(_device);

      const currentConfig = await FormantApp.getCurrentModuleConfiguration();
      if (currentConfig) {
        const parsedConfig = JSON.parse(currentConfig) as Viewer3DConfiguration;
        if (checkConfiguration(parsedConfig)) {
          setConfiguration(parsedConfig);
        }
      }
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
      FormantApp.addModuleDataListener((event) => {
        const d = new Date(event.time);
        universeData.setTime(d);
      });
      setAuthenticated(true);
    })();
  }, []);

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
      <UniverseDataContext.Provider value={universeData}>
        <DeviceContext.Provider value={device}>
          <Universe
            configHash={getUuidByString(JSON.stringify(config))}
            key={getUuidByString(JSON.stringify(config))}
          >
            <ambientLight />
            {buildScene(config, definedAndNotNull(currentDeviceId))};
          </Universe>
        </DeviceContext.Provider>
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
