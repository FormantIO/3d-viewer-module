import * as uuid from 'uuid';
import { SceneGraphElement } from '../src/main';

export const FARM_BOT_1_DEVICE_ID = 'farmbot1';
export const FARM_BOT_2_DEVICE_ID = 'farmbot2';
export const FARM_BOT_3_DEVICE_ID = 'farmbot3';

function createSatelliteLayer(
  latitude: number,
  longitude: number
): SceneGraphElement {
  return {
    id: uuid.v4(),
    editing: false,
    type: 'map',
    name: 'Satellite Map',
    deviceContext: '',
    children: [],
    visible: true,
    position: { type: 'manual', x: 0, y: 0, z: 0 },
    fieldValues: {
      latitude: {
        type: 'number',
        value: latitude,
      },
      longitude: {
        type: 'number',
        value: longitude,
      },
    },
    data: {},
    dataSources: [],
  };
}

function createFarmbot(
  name: string,
  deviceId: string,
  originLatitude: number,
  originLongitude: number
): SceneGraphElement {
  return {
    id: uuid.v4(),
    editing: false,
    type: 'empty',
    name,
    deviceContext: deviceId,
    children: [
      {
        id: uuid.v4(),
        editing: false,
        type: 'label',
        name: 'Device Name',
        deviceContext: deviceId,
        children: [],
        visible: true,
        position: {
          type: 'manual',
          x: 0,
          y: 0,
          z: 0.2,
        },
        fieldValues: {
          labelText: {
            type: 'text',
            value: name,
          },
        },
        data: {},
        dataSources: [],
      },
      {
        id: uuid.v4(),
        editing: false,
        type: 'point_cloud',
        name: 'Farmbot Point Cloud',
        deviceContext: FARM_BOT_1_DEVICE_ID,
        children: [],
        visible: true,
        position: {
          type: 'manual',
          x: 0,
          y: 0,
          z: 0,
        },
        fieldValues: {
          pointSize: {
            type: 'number',
            value: 5,
          },
        },
        data: {},
        dataSources: [
          {
            id: uuid.v4(),
            sourceType: 'realtime',
            rosTopicName: '/farmbot/points',
            rosTopicType: 'sensor_msgs/PointCloud2',
          },
        ],
      },
    ],
    visible: true,
    position: {
      type: 'gps',
      stream: 'farmbot.gps',
      relativeToLatitude: originLatitude,
      relativeToLongitude: originLongitude,
    },
    fieldValues: {},
    data: {},
    dataSources: [],
  };
}

export function createScene(configuration: any) {
  const devices = configuration.devices.map((device) =>
    createFarmbot(
      device.name,
      device.deviceId,
      configuration.latitude,
      configuration.longitude
    )
  );

  const sg: SceneGraphElement[] = [
    createSatelliteLayer(configuration.latitude, configuration.longitude),
    ...devices,

    // createFarmbot('Farmbot 2', FARM_BOT_2_DEVICE_ID),
    // createFarmbot('Farmbot 3', FARM_BOT_3_DEVICE_ID),
    // {
    //   id: uuid.v4(),
    //   editing: false,
    //   type: 'trail',
    //   name: 'Farmbot',
    //   deviceContext: FARM_BOT_3_DEVICE_ID,
    //   children: [],
    //   visible: true,
    //   position: {
    //     type: 'gps',
    //     stream: 'farmbot.gps',
    //     relativeToLatitude: 31.0119,
    //     relativeToLongitude: -92.5499,
    //   },
    //   fieldValues: {},
    //   data: {},
    //   dataSources: [],
    // },
    /*
    {
      id: uuid.v4(),
      editing: false,
      type: 'video',
      name: 'Video',
      deviceContext: 'Abc',
      children: [],
      visible: true,
      position: { type: 'manual', x: 0, y: 0, z: 0 },
      scale: { x: 0.25, y: 0.25, z: 0.25 },
      fieldValues: {
        shape: {
          type: 'text',
          value: 'sphere',
        },
      },
      data: {},
      dataSources: [
        {
          id: uuid.v4(),
          sourceType: 'realtime',
          rosTopicName: '/joint_states',
          rosTopicType: 'sensor_msgs/JointState',
        },
      ],
    },
    {
      id: uuid.v4(),
      editing: false,
      type: 'video',
      name: 'Video',
      deviceContext: 'Abc',
      children: [],
      visible: true,
      position: { type: 'hud', x: 0.2, y: 0.2 },
      scale: { x: 0.25, y: 0.25, z: 0.25 },
      fieldValues: {},
      data: {},
      dataSources: [
        {
          id: uuid.v4(),
          sourceType: 'realtime',
          rosTopicName: '/joint_states',
          rosTopicType: 'sensor_msgs/JointState',
        },
      ],
    }, */
    {
      id: uuid.v4(),
      editing: false,
      type: 'ground',
      name: 'Ground',
      deviceContext: undefined,
      children: [],
      visible: true,
      position: { type: 'manual', x: 0, y: 0, z: 0 },
      fieldValues: {
        flatAxes: {
          type: 'boolean',
          value: true,
        },
      },
      data: {},
    },
  ];
  return sg;
}
