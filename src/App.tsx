import { Universe } from "./Universe";
import { MarkerLayer } from "./layers/MarkerLayer";
import { UniverseDataContext } from "./UniverseDataContext";
import { GeometryLayer } from "./layers/GeometryLayer";
import { TransformLayer } from "./layers/TransformLayer";
import { DataSourceBuilder } from "./model/DataSourceBuilder";
import { PositioningBuilder } from "./model/PositioningBuilder";
import { GroundLayer } from "./layers/GroundLayer";
import { LayerDataContext } from "./LayerDataContext";
import { ExampleUniverseData } from "./ExampleUniverseData";
import { MapLayer } from "./layers/MapLayer";
import { RouteMakerLayer } from "./layers/RouteMakerLayer";
import { useEffect, useState } from "react";
import { Authentication, App as FormantApp } from "@formant/data-sdk";
import { Viewer3DConfiguration } from "./config";
import { IUniverseData } from "@formant/universe-core";

const query = new URLSearchParams(window.location.search);
const demoMode = query.get("auth") === null;

function buildUniverse(config: Viewer3DConfiguration): React.ReactNode {
  return <></>;
}

export function App() {
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [configuration, setConfiguration] = useState<
    Viewer3DConfiguration | undefined
  >();
  const [universeData] = useState<IUniverseData>(() => {
    return new ExampleUniverseData();
  });
  useEffect(() => {
    if (demoMode) {
      return;
    }
    (async () => {
      await Authentication.waitTilAuthenticated();
      setAuthenticated(true);
      const currentConfig = await FormantApp.getCurrentModuleConfiguration();
      if (currentConfig) {
        setConfiguration(JSON.parse(currentConfig) as Viewer3DConfiguration);
      }
      FormantApp.addModuleConfigurationListener((config) => {
        setConfiguration(
          JSON.parse(config.configuration) as Viewer3DConfiguration
        );
      });
    })();
  });
  if (demoMode) {
    return (
      <UniverseDataContext.Provider value={universeData}>
        <Universe>
          <ambientLight />
          <GroundLayer positioning={PositioningBuilder.fixed(0, 0.1, 0)} />
          <LayerDataContext.Provider
            value={{
              deviceId: "ekobot_device",
            }}
          >
            <RouteMakerLayer size={200} />
            <MapLayer
              // dataSource={DataSourceBuilder.telemetry("eko.gps", "json")}
              latitude={59.9139}
              longitude={10.7522}
              size={200}
              mapType="Satellite Street"
              mapBoxKey="pk.eyJ1IjoiYWJyYWhhbS1mb3JtYW50IiwiYSI6ImNrOWVuZm10NDA0M3MzZG53dWpjZ2k4d2kifQ.VOITHlgENYusw8tSYUlJ2w"
            />
            <TransformLayer
              positioning={PositioningBuilder.localization("eko.loc")}
            >
              <MarkerLayer
                positioning={PositioningBuilder.fixed(0.4, 0.1, 0.4)}
              />
              <GeometryLayer
                dataSource={DataSourceBuilder.telemetry("eko.geo", "json")}
              />
            </TransformLayer>
          </LayerDataContext.Provider>
        </Universe>
      </UniverseDataContext.Provider>
    );
  }
  if (authenticated && configuration) {
    <UniverseDataContext.Provider value={universeData}>
      <Universe>buildUniverse(configuration);</Universe>
    </UniverseDataContext.Provider>;
  }
  return <div>Not authenticated</div>;
}
