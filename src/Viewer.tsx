import { Universe } from "./layers/common/Universe";
import { UniverseDataContext } from "./layers/common/UniverseDataContext";
import { useEffect, useState } from "react";
import { Authentication, App as FormantApp } from "@formant/data-sdk";
import { Viewer3DConfiguration } from "./config";
import { IUniverseData } from "@formant/universe-core";
import { TelemetryUniverseData } from "@formant/universe-connector";
import { MissingConfig } from "./components/MissingConfig";
import { buildScene } from "./buildScene";

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
    if (!config.devices || !config.devices.length) return false;
    return true;
  };

  if (authenticated && configuration) {
    return (
      <UniverseDataContext.Provider value={universeData}>
        <Universe>
          <ambientLight />
          {buildScene(configuration, currentDeviceId)};
        </Universe>
      </UniverseDataContext.Provider>
    );
  }
  if (authenticated && !configuration) return <MissingConfig />;
  return <div />;
}
