import { Universe } from "./layers/common/Universe";
import { MarkerLayer } from "./layers/MarkerLayer";
import { UniverseDataContext } from "./layers/common/UniverseDataContext";
import { DataSourceBuilder } from "./layers/utils/DataSourceBuilder";
import { PositioningBuilder } from "./layers/utils/PositioningBuilder";
import { GroundLayer } from "./layers/GroundLayer";
import { LayerContext } from "./layers/common/LayerContext";
import { ARM1_ID, ARM2_ID, ARM3_ID, ExampleUniverseData } from "./layers/common/ExampleUniverseData";
import { MapLayer } from "./layers/MapLayer";
import { RouteMakerLayer } from "./layers/RouteMakerLayer";
import { useEffect, useState } from "react";
import { IUniverseData } from "@formant/universe-core";
import { PointCloudLayer } from "./layers/PointCloudLayer";
import { GeometryLayer, OccupancyGridLayer, PathLayer, PathType } from "./lib";
import { MissionPlanningLayer } from "./layers/MissionPlanningLayer";
import EmptyLayer from "./layers/EmptyLayer";
import { LayerType } from "./layers/common/LayerTypes";
import { URDFLayer } from "./layers/URDFLayer";
import { Label } from "./layers/objects/Label";

const query = new URLSearchParams(window.location.search);
const experimentalMode = query.get("experimental") === "true";

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


  return (
    <UniverseDataContext.Provider value={[universeData, liveUniverseData]}>
      <Universe
        configHash="fasd"
        config={{
          maps: [],
          visualizations: [],
        }}
      >
        <group>
          {/* <pointLight
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
          /> */}
          <hemisphereLight
            intensity={0.2 * 2.8}
            color={"#f8f9fc"}
            groundColor={"#282f45"}
          />
          <ambientLight
            intensity={3}
            color={"#f8f9fc"}
          />
        </group>

        <LayerContext.Provider
          value={{
            deviceId: ARM1_ID,
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
            <MissionPlanningLayer name="MissionPlanning" />
            <GeometryLayer
              name="3D Objects"
              dataSource={DataSourceBuilder.telemetry("walter.markers", "json")}
              allowTransparency={true}
              treePath={[1, 2]}
            />
            <primitive object={new Label("ARROW", false)} position={[-12, 5, 0]} />
            <primitive object={new Label("CUBE", false)} position={[-12, 4, 0]} />
            <primitive object={new Label("SPHERE", false)} position={[-12, 3, 0]} />
            <primitive object={new Label("CYLINDER", false)} position={[-12, 2, 0]} />
            <primitive object={new Label("LINE_STRIP", false)} position={[-29, -35, 0]} />
            <primitive object={new Label("LINE_LIST", false)} position={[-5, -35, 0]} />
            <primitive object={new Label("CUBE_LIST", false)} position={[-15, 10, 0]} />
            <primitive object={new Label("SPHERE_LIST", false)} position={[5, 10, 0]} />
            <primitive object={new Label("POINTS", false)} position={[-30, -15, 0]} />
            <primitive object={new Label("TEXT_VIEW_FACING", false)} position={[-12, -4, 0]} />
            <primitive object={new Label("MESH_RESOURCE", false)} position={[-12, -5, 0]} />
            <primitive object={new Label("TRIANGLE_LIST", false)} position={[25, -35, 0]} />
            <URDFLayer
              name="URDF"
              //positioning={PositioningBuilder.fixed(3, -3, 0)}
              positioning={PositioningBuilder.odometry("walter.localization")}
              jointStatesDataSource={DataSourceBuilder.telemetry("")}
              treePath={[1, 3]}
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
            />
          </EmptyLayer>
        </LayerContext.Provider>
      </Universe>
    </UniverseDataContext.Provider>
  );
}
