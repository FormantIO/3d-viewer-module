import { Universe } from "./layers/common/Universe";
import { UniverseDataContext } from "./layers/common/UniverseDataContext";
import { useCallback, useEffect, useRef, useState } from "react";
import { Authentication, App as FormantApp, Fleet } from "@formant/data-sdk";
import { Viewer3DConfiguration } from "./config";
import { definedAndNotNull, IUniverseData, TelemetryUniverseData, LiveUniverseData } from "@formant/data-sdk";


import { MissingConfig } from "./components/MissingConfig";
import { buildScene } from "./buildScene";
import getUuidByString from "uuid-by-string";

const query = new URLSearchParams(window.location.search);
const currentDeviceId = query.get("device") || "";

export function Viewer() {
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [configuration, setConfiguration] = useState<
    Viewer3DConfiguration | undefined
  >();
  const [deviceConfig, setDeviceConfig] = useState<any>();
  const universeData = useRef<IUniverseData>(new TelemetryUniverseData());
  const liveUniverseData = useRef<IUniverseData>(new LiveUniverseData());

  const timeRef = useRef<number>(0);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    (async () => {
      await Authentication.waitTilAuthenticated();
      const currentConfig = await FormantApp.getCurrentModuleConfiguration();
      const device = await Fleet.getDevice(currentDeviceId);
      await device.getConfiguration().then((config) => {
        setDeviceConfig(config);
      });
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
    const { advancedOptions } = configuration;
    const useTimeline = advancedOptions?.useTimeline;
    // clear the worker pool every time the configuration changes
    liveUniverseData.current.clearWorkerPool();
    universeData.current.clearWorkerPool();


    if (useTimeline || useTimeline === undefined) {
      FormantApp.addModuleDataListener((event) => {
        const d = new Date(event.time);
        // if the time is the same (paused), keep the heartbeat
        if (timeRef.current === d.getTime()) {
          if (!heartbeatRef.current) {
            heartbeatRef.current = setInterval(() => {
              universeData.current.setTime(d);
            }, 2000);
          }
          return;
        }
        // if the time is different, clear the interval and set the new time
        if (heartbeatRef.current) {
          clearInterval(heartbeatRef.current);
          heartbeatRef.current = null;
        }

        timeRef.current = d.getTime();
        universeData.current.setTime(d);
      });
    } else {
      universeData.current.setTime("live");
    }
    return () => {
      liveUniverseData.current.clearWorkerPool();
      universeData.current.clearWorkerPool();
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
      <UniverseDataContext.Provider value={[universeData.current, liveUniverseData.current]}>
        <Universe
          configHash={getUuidByString(JSON.stringify(config))}
          key={getUuidByString(JSON.stringify(config))}
          config={config}
          debug={!!config.advancedOptions?.debug}
        >
          {buildScene(config, definedAndNotNull(currentDeviceId), deviceConfig)}
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
