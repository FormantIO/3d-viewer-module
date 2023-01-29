import React from "react";
import { createRoot } from "react-dom/client";
import { Universe } from "./Universe";
import { MarkerLayer } from "./layers/MarkerLayer";
import { UniverseData } from "./UniverseData";
import { EmptyUniverseData } from "./EmptyUniverseData";
import { GeometryLayer } from "./layers/GeometryLayer";
import { TransformLayer } from "./layers/TransformLayer";
import { MapLayer } from "./layers/MapLayer";
import { DataSourceBuilder } from "./model/DataSourceBuilder";
import { PositioningBuilder } from "./model/PositioningBuilder";

const app = document.getElementById("root");
if (app) {
  createRoot(app).render(
    <UniverseData.Provider value={new EmptyUniverseData()}>
      <Universe>
        <ambientLight />
        <MapLayer dataSource={DataSourceBuilder.telemetry("eko.gps", "json")} />
        <TransformLayer
          positioning={PositioningBuilder.localization("eko.loc")}
        >
          <MarkerLayer positioning={PositioningBuilder.fixed(0, 0.1, 0)} />
          <GeometryLayer
            dataSource={DataSourceBuilder.telemetry("eko.geo", "json")}
          />
        </TransformLayer>
      </Universe>
    </UniverseData.Provider>
  );
}
