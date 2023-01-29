import React from "react";
import { createRoot } from "react-dom/client";
import { Universe } from "./Universe";
import { MarkerLayer } from "./layers/MarkerLayer";
import { UniverseDataContext } from "./UniverseDataContext";
import { EmptyUniverseData } from "./EmptyUniverseData";
import { GeometryLayer } from "./layers/GeometryLayer";
import { TransformLayer } from "./layers/TransformLayer";
import { RouteMakerLayer } from "./layers/RouteMakerLayer";
import { DataSourceBuilder } from "./model/DataSourceBuilder";
import { PositioningBuilder } from "./model/PositioningBuilder";
import { GroundLayer } from "./layers/GroundLayer";
import { LayerDataContext } from "./LayerDataContext";
import { ExampleUniverseData } from "./ExampleUniverseData";
import { MapLayer } from "./layers/MapLayer";
const app = document.getElementById("root");
if (app) {
  createRoot(app).render(
    <UniverseDataContext.Provider value={new ExampleUniverseData()}>
      <Universe>
        <ambientLight />
        <GroundLayer />
        <LayerDataContext.Provider
          value={{
            deviceId: "ekobot_device",
          }}
        >
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
            <MarkerLayer positioning={PositioningBuilder.fixed(0, 0.4, 0)} />
            <GeometryLayer
              dataSource={DataSourceBuilder.telemetry("eko.geo", "json")}
            />
          </TransformLayer>
        </LayerDataContext.Provider>
      </Universe>
    </UniverseDataContext.Provider>
  );
}
