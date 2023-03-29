export const testConfig = {
  maps: [
    {
      gpsMapType: "Satellite",
      gpsMapSize: 1000,
      name: "ground",
      mapType: "Ground Plane",
    },
    {
      gpsMapType: "Satellite",
      gpsMapSize: 1000,
      name: "map",
      mapType: "GPS Map",
    },
    {
      gpsMapType: "Satellite",
      gpsMapSize: 1000,
      mapType: "Occupancy Map",
      name: "ogrid",
      occupancyMapDataSource: {
        latestDataPoint: false,
        telemetryStreamName: "gen-local",
      },
    },
  ],
  visualizations: [
    {
      positionIndicatorVisualType: "Circle",
      pointCloudShape: "Circle",
      name: "device",
      visualizationType: "Position Indicator",
      transform: {
        positioningType: "Odometry",
        localizationWorldToLocal: true,
        localizationStream: "gen-local",
      },
    },
    {
      positionIndicatorVisualType: "Circle",
      pointCloudShape: "Circle",
      name: "pcd",
      visualizationType: "Point Cloud",
      pointCloudDecayTime: "50",
      pointCloudDataSource: {
        latestDataPoint: false,
        telemetryStreamName: "gen-local",
      },
    },
    {
      positionIndicatorVisualType: "Circle",
      visualizationType: "Path",
      name: "path",
      pathDataSource: {
        latestDataPoint: false,
        telemetryStreamName: "gen-local",
      },
    },
    {
      positionIndicatorVisualType: "Circle",
      visualizationType: "Waypoints",
      name: "waypoints layer",
      waypointsProperties: [
        {
          propertyType: "Boolean",
          propertyName: "Right Brush",
          booleanDefault: true,
        },
        { propertyType: "Boolean", propertyName: "Left Brush" },
        {
          propertyType: "String",
          stringDefault: '"BrushModesDefaultString"',
          propertyName: "Brush Modes",
        },
        {
          propertyType: "Integer",
          propertyName: "Velocity",
          numberDefault: "10",
        },
        {
          "0": "Dust1",
          "1": "Dust2",
          "2": "Dust3",
          propertyType: "Enum",
          enumDefault: "Dust2",
          propertyName: "Dust Suppression",
          enumLists: ["", "", ""],
        },
      ],
    },
  ],
};
