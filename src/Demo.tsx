import { Universe } from "./layers/common/Universe";
import { MarkerLayer } from "./layers/MarkerLayer";
import { UniverseDataContext } from "./layers/common/UniverseDataContext";
import { DataSourceBuilder } from "./layers/utils/DataSourceBuilder";
import { PositioningBuilder } from "./layers/utils/PositioningBuilder";
import { GroundLayer } from "./layers/GroundLayer";
import { LayerContext } from "./layers/common/LayerContext";
import { ARM1_ID, ARM2_ID, ARM3_ID, ExampleUniverseData } from "./layers/common/ExampleUniverseData";
import { RouteMakerLayer } from "./layers/RouteMakerLayer";
import { useEffect, useState } from "react";
import { IUniverseData } from "@formant/data-sdk";
import { PointCloudLayer } from "./layers/PointCloudLayer";
import { GeometryLayer, MapLayer, OccupancyGridLayer, PathLayer } from "./lib";
import { MissionPlanningLayer } from "./layers/MissionPlanningLayer";
import EmptyLayer from "./layers/EmptyLayer";
import { LayerType } from "./layers/common/LayerTypes";
import { URDFLayer } from "./layers/URDFLayer";



const query = new URLSearchParams(window.location.search);
const experimentalMode = query.get("experimental") === "true";
const debugMode = query.get("debug") === "true";

export function Demo() {
  const [universeData] = useState<IUniverseData>(
    () => new ExampleUniverseData()
  );

  const [liveUniverseData] = useState<IUniverseData>(
    () => new ExampleUniverseData()
  );
  useEffect(() => {
    const interval = setInterval(() => {
      const date = new Date();
      universeData.setTime(date);
      liveUniverseData.setTime(date);
    }, 100);
    return () => clearInterval(interval);
  });


  // TODO: this should follow the buildScene pattern from Viewer.tsx
  return (
    <UniverseDataContext.Provider value={[universeData, liveUniverseData]}>
      <Universe
        configHash="fasd"
        config={{
          maps: [],
          visualizations: [],
        }}
        debug={debugMode}
      >


        <LayerContext.Provider
          value={{
            deviceId: ARM1_ID,
          }}
        >
          <EmptyLayer name="Maps" treePath={[0]}>
            <GroundLayer
              positioning={PositioningBuilder.fixed(0, 0, 0)}
              name="Ground"
              treePath={[2, 0]}
              type={LayerType.AXIS}
              id="ground"
            />
            <MapLayer
              name="Map"
              latitude={37.6713541}
              longitude={-97.20016869}
              mapType="Satellite"
              size={400}
              treePath={[0, 0]}
              visible={false}
              id="map0"
            />
            <OccupancyGridLayer
              dataSource={DataSourceBuilder.telemetry(
                "walter.localization",
                "localization"
              )}
              name="Occupancy Grid"
              treePath={[0, 1]}
              id="occupancyGrid"
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
              trailEnabled={true}
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
            <PointCloudLayer
              dataSource={DataSourceBuilder.telemetry(
                "walter.localization",
                "localization"
              )}
              positioning={PositioningBuilder.fixed(3, 0, 0)}
              name="Point Cloud 2"
              decayTime={1}
              treePath={[1, 2]}
            />
            <MissionPlanningLayer name="MissionPlanning" />
            <GeometryLayer
              name="3D Objects"
              dataSource={DataSourceBuilder.telemetry("walter.markers", "json")}
              allowTransparency={true}
              treePath={[1, 2]}
            />
            <URDFLayer
              name="URDF"
              //positioning={PositioningBuilder.fixed(3, -3, 0)}
              positioning={PositioningBuilder.odometry("walter.localization")}
              jointStatesDataSource={DataSourceBuilder.telemetry("")}
              treePath={[1, 3]}
            />
            <PathLayer
              dataSource={DataSourceBuilder.telemetry(
                "walter.localization",
                "localization"
              )}
              name="Path"
              treePath={[1, 4]}
              id="path1"
            />
            <PathLayer
              dataSource={DataSourceBuilder.telemetry(
                "walter.localization",
                "localization"
              )}
              name="Flattened path"
              flatten={true}
              treePath={[1, 5]}
              id="path2"
            />

            {/* <RouteMakerLayer size={200} name="Route Builder" /> */}
          </EmptyLayer>
        </LayerContext.Provider>
        <LayerContext.Provider
          value={{
            deviceId: ARM2_ID,
          }}>
          <EmptyLayer name="ARM2" treePath={[2]}>
            <URDFLayer
              name="URDF2"
              positioning={PositioningBuilder.fixed(3, -3, 0)}
              jointStatesDataSource={DataSourceBuilder.telemetry("")}
              treePath={[2, 3]}
              id="urdf2"
            />
          </EmptyLayer>
        </LayerContext.Provider>
        <LayerContext.Provider
          value={{
            deviceId: ARM3_ID,
          }}>
          <EmptyLayer name="ARM3" treePath={[2]}>
            <URDFLayer
              name="URDF3"
              positioning={PositioningBuilder.fixed(2.5, -2.5, 0)}
              jointStatesDataSource={DataSourceBuilder.telemetry("")}
              treePath={[2, 3]}
              id="urdf3"
            />
          </EmptyLayer>
        </LayerContext.Provider>
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
  );
}
