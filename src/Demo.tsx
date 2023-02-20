import { Universe } from "./layers/common/Universe";
import { MarkerLayer } from "./layers/MarkerLayer";
import { UniverseDataContext } from "./layers/common/UniverseDataContext";
import { GeometryLayer } from "./layers/GeometryLayer";
import { DataVisualizationLayer } from "./layers/DataVisualizationLayer";
import { DataSourceBuilder } from "./layers/utils/DataSourceBuilder";
import { PositioningBuilder } from "./layers/utils/PositioningBuilder";
import { GroundLayer } from "./layers/GroundLayer";
import { LayerContext } from "./layers/common/LayerContext";
import { ExampleUniverseData } from "./layers/common/ExampleUniverseData";
import { MapLayer } from "./layers/MapLayer";
import { RouteMakerLayer } from "./layers/RouteMakerLayer";
import { useState } from "react";
import { IUniverseData } from "@formant/universe-core";
import { PointCloudLayer } from "./layers/PointCloudLayer";

const query = new URLSearchParams(window.location.search);
const experimentalMode = query.get("experimental") === "true";

export function Demo() {
  const [universeData] = useState<IUniverseData>(
    () => new ExampleUniverseData()
  );
  return (
    <UniverseDataContext.Provider value={universeData}>
      <Universe configHash="fasd">
        <ambientLight />
        <GroundLayer
          positioning={PositioningBuilder.fixed(0, 0.1, 0)}
          name="Ground"
        />
        <LayerContext.Provider
          value={{
            deviceId: "ekobot_device",
          }}
        >
          {experimentalMode && (
            <RouteMakerLayer size={200} name="Route Builder" />
          )}
          <MapLayer
            latitude={59.9139}
            longitude={10.7522}
            size={200}
            mapType="Satellite Street"
            mapBoxKey=""
            name="Map"
          />
          <DataVisualizationLayer
            positioning={PositioningBuilder.odometry("eko.loc")}
            name="Ekobot"
          >
            <MarkerLayer
              positioning={PositioningBuilder.fixed(1, 0.1, 0.4)}
              name="Marker"
            />
            <GeometryLayer
              dataSource={DataSourceBuilder.telemetry("eko.geo", "json")}
              name="Geometry"
            />
            <PointCloudLayer
              dataSource={DataSourceBuilder.telemetry("eko.geo", "point cloud")}
              positioning={PositioningBuilder.fixed(-1, 0.1, 0.4)}
              name="Point Cloud"
            />
          </DataVisualizationLayer>
        </LayerContext.Provider>
      </Universe>
    </UniverseDataContext.Provider>
  );
}
