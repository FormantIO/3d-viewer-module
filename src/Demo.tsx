import { Universe } from "./layers/common/Universe";
import { MarkerLayer } from "./layers/MarkerLayer";
import { UniverseDataContext } from "./layers/common/UniverseDataContext";
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
import { OccupancyGridLayer, PathLayer, PathType } from "./lib";
import { WaypointsLayer } from "./layers/WaypointsLayer";
import EmptyLayer from "./layers/EmptyLayer";
import { LayerType } from "./layers/common/LayerTypes";

const query = new URLSearchParams(window.location.search);
const experimentalMode = query.get("experimental") === "true";

export function Demo() {
  const [universeData] = useState<IUniverseData>(
    () => new ExampleUniverseData()
  );
  return (
    <UniverseDataContext.Provider value={universeData}>
      <Universe
        configHash="fasd"
        config={{
          maps: [],
          visualizations: [],
        }}
      >
        <ambientLight />
        <LayerContext.Provider
          value={{
            deviceId: "ekobot_device",
          }}
        >
          <EmptyLayer name="Maps" treePath={[0]}>
            <GroundLayer
              positioning={PositioningBuilder.fixed(0, 0.1, 0)}
              name="Ground"
              treePath={[0, 0]}
              type={LayerType.AXIS}
            />
            {/* <MapLayer
              name="Map"
              latitude={37.6713541}
              longitude={-97.20016869}
              mapType="Satellite"
              size={400}
              treePath={[0, 2]}
            /> */}
            <OccupancyGridLayer
              dataSource={DataSourceBuilder.telemetry(
                "walter.localization",
                "localization"
              )}
              name="Occupancy Grid"
              treePath={[0, 1]}
            />
            <PathLayer
              dataSource={DataSourceBuilder.telemetry(
                "walter.localization",
                "localization"
              )}
              pathType={PathType.STATIC}
              pathWidth={0.25}
            />
          </EmptyLayer>
          <EmptyLayer name="Device Layers" treePath={[1]}>
            {experimentalMode && (
              <RouteMakerLayer size={200} name="Route Builder" />
            )}
            <MarkerLayer
              positioning={PositioningBuilder.odometry("walter.localization")}
              name="Marker"
              treePath={[1, 1]}
            />

            <PointCloudLayer
              dataSource={DataSourceBuilder.telemetry(
                "walter.localization",
                "localization"
              )}
              name="Point Cloud"
              decayTime={1}
              treePath={[1, 2]}
            />
            <WaypointsLayer pathType={PathType.STATIC} pathWidth={0.25} />
            {/* <RouteMakerLayer size={200} name="Route Builder" /> */}
          </EmptyLayer>
        </LayerContext.Provider>
      </Universe>
    </UniverseDataContext.Provider>
  );
}
