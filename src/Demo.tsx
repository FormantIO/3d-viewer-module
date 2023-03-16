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
import { OccupancyGridLayer, PathLayer } from "./lib";
import { WaypointsLayer } from "./layers/WaypointsLayer";

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
        <MapLayer
          positioning={PositioningBuilder.fixed(0, 0, -1)}
          name="Map"
          latitude={37.422}
          longitude={-122.074}
          mapType="Satellite"
          size={1000}
        />
        <LayerContext.Provider
          value={{
            deviceId: "ekobot_device",
          }}
        >
          {experimentalMode && (
            <RouteMakerLayer size={200} name="Route Builder" />
          )}
          <DataVisualizationLayer name="Ekobot">
            <MarkerLayer
              positioning={PositioningBuilder.odometry("walter.localization")}
              name="Marker"
              size={5}
              sizeType={"static"}
            />
            <OccupancyGridLayer
              dataSource={DataSourceBuilder.telemetry(
                "walter.localization",
                "localization"
              )}
              name="Occupancy Grid"
            />
            <PointCloudLayer
              dataSource={DataSourceBuilder.telemetry(
                "walter.localization",
                "localization"
              )}
              name="Point Cloud"
              pointShape="Rectangle"
              pointSize={1}
              decayTime={1}
              color1={"#729fda"}
              color2={"#F89973"}
            />
            <PathLayer
              dataSource={DataSourceBuilder.telemetry(
                "walter.localization",
                "localization"
              )}
              name="Path"
              pathWidth={5}
            />
            <WaypointsLayer />
            {/* <RouteMakerLayer size={200} name="Route Builder" /> */}
          </DataVisualizationLayer>
        </LayerContext.Provider>
      </Universe>
    </UniverseDataContext.Provider>
  );
}
