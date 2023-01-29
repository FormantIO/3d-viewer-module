import React from "react";
import { createRoot } from "react-dom/client";
import { Universe } from "./Universe";
import { MarkerLayer } from "./layers/MarkerLayer";
import { UniverseDataContext } from "./UniverseDataContext";
import { EmptyUniverseData } from "./EmptyUniverseData";
import { GeometryLayer } from "./layers/GeometryLayer";
import { TransformLayer } from "./layers/TransformLayer";
import { MapLayer } from "./layers/MapLayer";
import { DataSourceBuilder } from "./model/DataSourceBuilder";
import { PositioningBuilder } from "./model/PositioningBuilder";
import { GroundLayer } from "./layers/GroundLayer";
import { LayerDataContext } from "./LayerDataContext";
const app = document.getElementById("root");
if (app) {
  createRoot(app).render(
    <UniverseDataContext.Provider value={new EmptyUniverseData()}>
      <Universe>
        <ambientLight />
        <GroundLayer />
        <LayerDataContext.Provider
          value={{
            deviceId: "ekobot_device",
          }}
        >
          <MapLayer
            dataSource={DataSourceBuilder.telemetry("eko.gps", "json")}
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
