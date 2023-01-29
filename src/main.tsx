import React from "react";
import { createRoot } from "react-dom/client";
import { Universe } from "./Universe";
import { MarkerLayer } from "./layers/MarkerLayer";
import { UniverseData } from "./UniverseData";
import { EmptyUniverseData } from "./EmptyUniverseData";
import { GeometryLayer } from "./layers/GeometryLayer";
import { TransformLayer } from "./layers/TransformLayer";
import { MapLayer } from "./layers/MapLayer";

const app = document.getElementById("root");
if (app) {
  createRoot(app).render(
    <UniverseData.Provider value={new EmptyUniverseData()}>
      <Universe>
        <ambientLight />
        <MapLayer />
        <TransformLayer>
          <MarkerLayer />
          <GeometryLayer />
        </TransformLayer>
      </Universe>
    </UniverseData.Provider>
  );
}
