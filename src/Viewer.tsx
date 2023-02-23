import { Universe } from "./layers/common/Universe";
import { UniverseDataContext } from "./layers/common/UniverseDataContext";
import { useCallback, useEffect, useState } from "react";
import { Authentication, App as FormantApp } from "@formant/data-sdk";
import { Viewer3DConfiguration } from "./config";
import { definedAndNotNull, IUniverseData } from "@formant/universe-core";
import { TelemetryUniverseData } from "@formant/universe-connector";
import { MissingConfig } from "./components/MissingConfig";
import { buildScene } from "./buildScene";
import getUuidByString from "uuid-by-string";
import DebugContainer from "./components/DebugContainer";

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
  const [typedString, setTypedString] = useState('');
  const [debugMode, setDebugMode] = useState(false);

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
    if (
      (!config.maps || !config.maps.length) &&
      (!config.visualizations || !config.visualizations.length)
    )
      return false;
    return true;
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    const key = event.key.toLowerCase();
    const newTypedString = typedString + key;
    setTypedString((string) => string + key);

    if (newTypedString.endsWith('debug')) {
      console.log('Debug mode activated!');
      setDebugMode(true);
      setTypedString('');
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [typedString]);

  const scene = useCallback(
    (config: Viewer3DConfiguration) => (
      <UniverseDataContext.Provider value={universeData}>
        <Universe configHash={getUuidByString(JSON.stringify(config))} key={getUuidByString(JSON.stringify(config))}>
          <ambientLight />
          {buildScene(config, definedAndNotNull(currentDeviceId))};
        </Universe>
      </UniverseDataContext.Provider>
    ),
    [universeData, currentDeviceId, configuration]
  );

  if (debugMode) {
    return (
      <DebugContainer config={configuration} universeData={universeData} />
    );
  }

  if (authenticated && configuration) {
    return scene(configuration);
  }
  if (authenticated && !configuration) return <MissingConfig />;
  return <div />;
}
