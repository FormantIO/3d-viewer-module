import {
  definedAndNotNull,
  UniverseTelemetrySource,
} from "@formant/universe-core";
import {
  parseDataSource,
  parsePositioning,
  Viewer3DConfiguration,
} from "./config";
import { LayerContext } from "./layers/common/LayerContext";
import EmptyLayer from "./layers/EmptyLayer";
import { GeometryLayer } from "./layers/GeometryLayer";
import { GroundLayer } from "./layers/GroundLayer";
import { MapLayer } from "./layers/MapLayer";
import { MarkerLayer } from "./layers/MarkerLayer";
import { PointCloudLayer } from "./layers/PointCloudLayer";
import { PositioningBuilder } from "./layers/utils/PositioningBuilder";
import getUuidByString from "uuid-by-string";
import { OccupancyGridLayer } from "./layers/OccupancyGridLayer";
import { PathLayer } from "./layers/PathLayer";
import { LayerType } from "./layers/common/LayerTypes";
import { cloneElement } from "react";
import { MissionPlanningLayer } from "./layers/MissionPlanningLayer";
import { URDFLayer } from "./layers/URDFLayer";
import { ImageLayer } from "./layers/ImageLayer";
import { GLTFLayer } from "./layers/GLTFLayer";
import PointOfInterstLayer from "./layers/PointOfInterestLayer";

export function buildScene(
  config: Viewer3DConfiguration,
  currentDeviceId: string
): React.ReactNode {
  const devices: React.ReactNode[] = [];
  let deviceLayers: React.ReactNode[] = [];
  let mapLayers: JSX.Element[] = [];
  let sceneLayers: React.ReactNode[] = [];

  const MAP_TREEPATH = 0;
  const DEVICE_TREEPATH = 1;
  const SCENE_TREEPATH = 2;

  // treePath is used to identify the layer in the scene graph
  // it is an array of numbers that represent the path to the layer
  // from the root of the scene graph

  // this is used to get a unique key for each layer
  const configHash = getUuidByString(JSON.stringify(config));

  mapLayers = (config.maps || []).map((layer, i) => {
    const positioning = layer.transformType
      ? parsePositioning(layer)
      : PositioningBuilder.fixed(0, 0, 0);

    if (layer.mapType === "GPS") {
      const defaultLong = -122.6765;
      const defaultLat = 45.5231;

      const dataSource = parseDataSource(layer);

      const distanceNum = parseFloat(layer.gpsMapSize);
      return (
        <MapLayer
          key={"map" + i + configHash}
          positioning={positioning}
          mapType={layer.gpsMapType || "Satellite"}
          size={distanceNum}
          latitude={layer.gpsMapLatitude || defaultLat}
          longitude={layer.gpsMapLongitude || defaultLong}
          dataSource={dataSource as UniverseTelemetrySource}
          name={layer.name || "Map"}
          treePath={[MAP_TREEPATH, i]}
        />
      );
    } else if (layer.mapType === "Occupancy") {
      const dataSource = parseDataSource(layer);
      return (
        <OccupancyGridLayer
          key={"occupancy_grid" + i + configHash}
          dataSource={dataSource as UniverseTelemetrySource | undefined}
          treePath={[MAP_TREEPATH, i]}
          name={layer.name || "Occupancy Grid"}
        />
      );
    }
    // add a new map layer type, example:
    // else if (layer.mapType === "CustomMap") {
    //   const dataSource = parseDataSource(layer); // parse the data source if needed
    //   return (
    //     <CustomMapLayer
    //       key={"customMap" + i + configHash} // use configHash to make sure the key is unique
    //       dataSource={dataSource as UniverseTelemetrySource | undefined}
    //       treePath={[MAP_TREEPATH, i]} // use MAP_TREEPATH to make sure the layer is a child of the map
    //       name={layer.name || "Image"}
    //        // add any other props you need
    //     />
    //   );
    // }

    throw new Error("Unknown map type");
  });
  (config.visualizations || []).forEach((layer, i) => {
    // positioning for all device layers.
    const positioning = layer.transformType
      ? parsePositioning(layer)
      : PositioningBuilder.fixed(0, 0, 0);

    if (layer.visualizationType === "Position indicator") {
      if (layer.positionIndicatorUseURDF) {
        deviceLayers.push(
          <URDFLayer
            key={"vis" + i + configHash}
            positioning={positioning}
            treePath={[DEVICE_TREEPATH, i]}
            name={layer.name || "URDF"}
            jointStatesDataSource={parseDataSource(layer)}
          />
        );
      } else {
        deviceLayers.push(
          <MarkerLayer
            key={"vis" + i + configHash}
            positioning={positioning}
            treePath={[DEVICE_TREEPATH, i]}
            name={layer.name || "Marker"}
          />
        );
      }
    } else if (layer.visualizationType === "Path") {
      const dataSource = parseDataSource(layer);
      const { pathType, pathWidth } = layer;
      deviceLayers.push(
        <PathLayer
          key={"local_path_layer" + i + configHash}
          pathType={pathType}
          pathWidth={pathWidth}
          dataSource={dataSource as UniverseTelemetrySource | undefined}
          treePath={[DEVICE_TREEPATH, i]}
          name={layer.name || "Local Path "}
        />
      );
    } else if (layer.visualizationType === "Point cloud") {
      const dataSource = parseDataSource(layer);
      const { pointCloudDecayTime, pointCloudUseColors } = layer;
      deviceLayers.push(
        <PointCloudLayer
          key={"pointcloud" + i + configHash}
          dataSource={dataSource as UniverseTelemetrySource | undefined}
          treePath={[DEVICE_TREEPATH, i]}
          name={layer.name || "Point Cloud"}
          decayTime={pointCloudDecayTime || 1}
          useColors={pointCloudUseColors || false}
        />
      );
    } else if (layer.visualizationType === "Marker array") {
      const dataSource = parseDataSource(layer);
      if (dataSource) {
        deviceLayers.push(
          <GeometryLayer
            key={"geo" + i + configHash}
            positioning={positioning}
            dataSource={dataSource as UniverseTelemetrySource}
            treePath={[DEVICE_TREEPATH, i]}
            name={layer.name || "Geometry"}
          />
        );
      }
    } else if (layer.visualizationType === "Image") {
      deviceLayers.push(
        <ImageLayer
          key={"vis" + i + configHash}
          positioning={positioning}
          treePath={[DEVICE_TREEPATH, i]}
          name={layer.name || "Image"}
          width={layer.imageWidth || 1}
          height={layer.imageHeight || 1}
          fileId={layer.imageFileId || ""}
        />
      );
    } else if (layer.visualizationType === "GLTF") {
      deviceLayers.push(
        <GLTFLayer
          key={"vis" + i + configHash}
          positioning={positioning}
          treePath={[DEVICE_TREEPATH, i]}
          name={layer.name || "GLTF"}
          scale={layer.gltfScale || 1}
          fileId={layer.gltfFileId || ""}
        />
      );
    } else if (layer.visualizationType === "Points of interest") {
      const dataSource = parseDataSource(layer);
      if (dataSource) {
        deviceLayers.push(
          <PointOfInterstLayer
            key={"geo" + i + configHash}
            positioning={positioning}
            dataSource={dataSource as UniverseTelemetrySource}
            treePath={[DEVICE_TREEPATH, i]}
            name={layer.name || "Geometry"}
          />
        );
      }
    } else {
      throw new Error("Unknown visualization type");
    }
  });
  sceneLayers.push(
    <GroundLayer
      key={"ground" + configHash}
      treePath={[SCENE_TREEPATH, 255]}
      name={"Ground Plane"}
      type={LayerType.AXIS}
    />
  );

  if (config.missionPlanning && config.missionPlanning!.length > 0) {
    const { pathWidth, pathType, commandName } = config.missionPlanning[0];
    deviceLayers.push(
      <MissionPlanningLayer
        key="missionPlanningLayer"
        pathType={pathType}
        pathWidth={pathWidth}
        commandName={commandName}
      />
    );
  }

  // first map layer is visible, others are hidden
  mapLayers = mapLayers.map((layer, i) => {
    return cloneElement(layer, { visible: i === 0 });
  });

  devices.push(
    <LayerContext.Provider
      key={"maps"}
      value={{
        deviceId: definedAndNotNull(currentDeviceId),
      }}
    >
      <EmptyLayer name={"Maps"} treePath={[MAP_TREEPATH]}>
        {mapLayers}
      </EmptyLayer>
    </LayerContext.Provider>
  );
  devices.push(
    <LayerContext.Provider
      key={"visualizations"}
      value={{
        deviceId: definedAndNotNull(currentDeviceId),
      }}
    >
      <EmptyLayer name={"Device Layers"} treePath={[DEVICE_TREEPATH]}>
        {deviceLayers}
      </EmptyLayer>
    </LayerContext.Provider>
  );
  devices.push(
    <EmptyLayer name={"Scene"} treePath={[SCENE_TREEPATH]}>
      {sceneLayers}
    </EmptyLayer>
  );
  deviceLayers = [];
  return devices;
}
