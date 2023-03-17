import {
  CloseSubscription,
  DataSourceState,
  IRealtimeStream,
  Interaction,
  ITelemetryRosStream,
  ITelemetryStream,
  IUniverseStatistics,
  UniverseDataSource,
  DataStatus,
  IMarker3DArray,
  IMap,
  IPcd,
  IPose,
  IUniverseData,
  INumericSetEntry,
  ITransform,
  IBitset,
  ITransformNode,
  ILocation,
  IJointState,
  IUniverseGridMap,
  IUniverseOdometry,
} from "@formant/universe-core";
import { SplineCurve, Vector2 } from "three";
import seedrandom from "seedrandom";
import { IUniversePointCloud } from "@formant/universe-core/dist/types/universe-core/src/model/IUniversePointCloud";
import { IUniversePath } from "@formant/universe-core/dist/types/universe-core/src/model/IUniversePath";
import { RigidBodyDesc, World } from "@dimforge/rapier3d";
import { pointCloud, occupancyMap } from "./exampleData";
import { clone } from "../../common/clone";

export const SPOT_ID = "abc";
export const ARM1_ID = "asdfadsfas";
export const ARM2_ID = "124fasd";
export const ARM3_ID = "77hrtesgdafdsh";

export class ExampleUniverseData implements IUniverseData {
  construtor() {
    /* // create rapier3d world
    const world = new World({ x: 0, y: -9.81, z: 0 });
    // create a rigid body
    let rigidBodyDesc = RigidBodyDesc.dynamic()
      // The rigid body translation.
      // Default: zero vector.
      .setTranslation(0.0, 5.0, 0)
      // The rigid body rotation.
      // Default: no rotation.
      .setRotation({ x: 0, y: 0, z: 0, w: 1 });
    const body = world.createRigidBody(rigidBodyDesc);

    // run world simulation
    setInterval(() => {
      world.step();
      const pos = world.getRigidBody(body.handle).translation;
    }, 16);
    */
  }

  subscribeToPath(
    deviceId: string,
    source: UniverseDataSource,
    callback: (data: Symbol | IUniversePath) => void
  ): CloseSubscription {
    setInterval(() => {
      const path: IUniversePath = {
        worldToLocal: {
          translation: {
            x: 0,
            y: 0,
            z: 0,
          },
          rotation: {
            x: 0,
            y: 0,
            z: 0,
            w: 1,
          },
        },
        poses: [
          {
            translation: {
              x: 3.3545788855933396,
              y: -2.1870991935927204,
              z: 0.154354741654536,
            },
            rotation: {
              x: -0.0007247281610034406,
              y: 0.006989157758653164,
              z: 0.9746800661087036,
              w: 0.2234935611486435,
            },
          },
          {
            translation: {
              x: 4.3545788855933396,
              y: -1.1870991935927204,
              z: 0.154354741654536,
            },
            rotation: {
              x: -0.0007247281610034406,
              y: 0.006989157758653164,
              z: 0.9746800661087036,
              w: 0.2234935611486435,
            },
          },
          {
            translation: {
              x: 5.3545788855933396,
              y: 1.1870991935927204,
              z: 0.154354741654536,
            },
            rotation: {
              x: -0.0007247281610034406,
              y: 0.006989157758653164,
              z: 0.9746800661087036,
              w: 0.2234935611486435,
            },
          },
        ],
      };
      callback(path);
    }, 1000);
    return () => {};
  }

  subscribeToImage(
    _deviceId: string,
    _source: UniverseDataSource,
    _callback: (image: HTMLCanvasElement | DataStatus) => void
  ): CloseSubscription {
    throw new Error("Method not implemented.");
  }

  addInteraction(_interaction: Interaction) {
    throw new Error("Method not implemented.");
  }

  removeInteraction(_id: string) {
    throw new Error("Method not implemented.");
  }

  getInteractions(): Interaction[] {
    throw new Error("Method not implemented.");
  }

  addInteractionsChangedListener(
    _callback: (interactions: Interaction[]) => void
  ): () => void {
    throw new Error("Method not implemented.");
  }

  addInteractionListener(
    _callback: (interaction: Interaction) => void
  ): () => void {
    throw new Error("Method not implemented.");
  }

  sendCommand(
    _deviceId: string,
    _name: string,
    _data?: string | undefined
  ): Promise<void> {
    throw new Error("Method not implemented.");
  }

  subscribeToOdometry(
    _deviceId: string,
    _source: UniverseDataSource,
    callback: (data: IUniverseOdometry) => void
  ): CloseSubscription {
    setInterval(() => {
      callback({
        worldToLocal: {
          translation: {
            x: 0,
            y: 0,
            z: 0,
          },
          rotation: {
            x: 0,
            y: 0,
            z: 0,
            w: 1,
          },
        },
        pose: {
          translation: {
            x: 3.3545788855933396,
            y: -2.1870991935927204,
            z: 0.154354741654536,
          },
          rotation: {
            x: -0.0007247281610034406,
            y: 0.006989157758653164,
            z: 0.9746800661087036,
            w: 0.2234935611486435,
          },
        },
        covariance: [],
      });
    }, 1000);
    return () => {};
  }

  subscribeToPose(
    _deviceId: string,
    _source: UniverseDataSource,
    _callback: (data: IPose) => void
  ): CloseSubscription {
    throw new Error("Method not implemented.");
  }

  sendRealtimeBoolean(
    _deviceId: string,
    _streamName: string,
    _value: boolean
  ): Promise<void> {
    throw new Error("Method not implemented.");
  }

  sendRealtimeBitset(
    _deviceId: string,
    _streamName: string,
    _bitset: IBitset
  ): Promise<void> {
    throw new Error("Method not implemented.");
  }

  sendRealtimePose(
    _deviceId: string,
    _streamName: string,
    _pose: ITransform
  ): Promise<void> {
    throw new Error("Method not implemented.");
  }

  subscribeToNumeric(
    _deviceId: string,
    _source: UniverseDataSource,
    _callback: (num: [number, number][]) => void
  ): CloseSubscription {
    throw new Error("Method not implemented.");
  }

  subscribeToNumericSet(
    _deviceId: string,
    _source: UniverseDataSource,
    callback: (entry: [number, INumericSetEntry[]][]) => void
  ): CloseSubscription {
    setInterval(() => {
      callback([
        [
          Date.now() - 3000,
          [
            { value: Math.random(), label: "test" },
            { value: Math.random(), label: "bar" },
          ],
        ],
        [
          Date.now() - 2000,
          [
            { value: Math.random(), label: "test" },
            { value: Math.random(), label: "bar" },
          ],
        ],
        [
          Date.now() - 1000,
          [
            { value: Math.random(), label: "test" },
            { value: Math.random(), label: "bar" },
          ],
        ],
        [
          Date.now() - 0,
          [
            { value: Math.random(), label: "test" },
            { value: Math.random(), label: "bar" },
          ],
        ],
      ]);
    }, 1000);
    return () => {};
  }

  sendRealtimeButtonState(
    _deviceId: string,
    _streamName: string,
    _state: boolean
  ): void {
    throw new Error("Method not implemented.");
  }

  subscribeToGridMap(
    _deviceId: string,
    _source: UniverseDataSource,
    _callback: (data: IUniverseGridMap | DataStatus) => void
  ): CloseSubscription {
    const intervalMap = setInterval(() => {
      _callback(clone(occupancyMap as IUniverseGridMap));
    }, 1000);
    return () => {
      clearInterval(intervalMap);
    };
  }

  subscribeToVideo(
    _deviceId: string,
    _source: UniverseDataSource,
    callback: (data: HTMLCanvasElement | DataStatus) => void
  ): () => void {
    const image = new Image();
    image.crossOrigin = "Anonymous";
    image.addEventListener(
      "load",
      () => {
        const canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        const context = canvas.getContext("2d");
        if (context) {
          context.drawImage(image, 0, 0);
          callback(canvas);
        }
      },
      false
    );
    image.src =
      "https://threejs.org/examples/textures/2294472375_24a3b8ef46_o.jpg";
    return () => {};
  }

  subscribeToJson<T>(
    _deviceId: string,
    _source: UniverseDataSource,
    _callback: (data: T | DataStatus) => void
  ): CloseSubscription {
    throw new Error("Method not implemented.");
  }

  subscribeToText(
    _deviceId: string,
    _source: UniverseDataSource,
    _callback: (text: string | DataStatus) => void
  ): CloseSubscription {
    throw new Error("Method not implemented.");
  }

  getStatistics(): Promise<IUniverseStatistics> {
    throw new Error("Method not implemented.");
  }

  subscribeDataSourceStateChange(
    _deviceId: string,
    _source: UniverseDataSource,
    _onDataSourceStateChange?: (state: DataSourceState) => void
  ): CloseSubscription {
    throw new Error("Method not implemented.");
  }

  time = Date.now();

  setTime(time: Date | "live"): void {
    if (time === "live") {
      throw new Error("Not implemented");
    } else {
      this.time = time.getTime();
    }
  }

  async getLatestTransformTrees(
    deviceId: string
  ): Promise<{ streamName: string; transformTree: ITransformNode }[]> {
    if (deviceId === SPOT_ID) {
      return [
        {
          streamName: "spotTf",
          transformTree: await fetch(
            "https://formant-3d-models.s3.us-west-2.amazonaws.com/spotjoint_sit.json"
          ).then((_) => _.json() as ITransformNode),
        },
      ];
    }
    return [];
  }

  async getLatestLocations(): Promise<
    {
      streamName: string;
      location: ILocation;
    }[]
  > {
    return [
      {
        streamName: "spotLocation",
        location: {
          latitude: 45.4661989,
          longitude: -122.5782375,
        },
      },
    ];
  }

  async getDeviceContexts(): Promise<
    { deviceName: string; deviceId: string }[]
  > {
    return [
      { deviceName: "Spot-9000", deviceId: SPOT_ID },
      { deviceName: "Roboarm 1", deviceId: ARM1_ID },
      { deviceName: "Roboarm 2", deviceId: ARM2_ID },
      { deviceName: "Roboarm 3", deviceId: ARM3_ID },
    ];
  }

  async getDeviceContextName(deviceId: string): Promise<string | undefined> {
    if (deviceId === SPOT_ID) {
      return "Spot-9000";
    }
    if (deviceId === ARM1_ID) {
      return "Roboarm 1";
    }
    if (deviceId === ARM2_ID) {
      return "Roboarm 2";
    }
    if (deviceId === ARM3_ID) {
      return "Roboarm 3";
    }
    return undefined;
  }

  async getTelemetryStreamType(
    _deviceId: string,
    streamName: string
  ): Promise<string | undefined> {
    if (streamName === "spotTf") {
      return "transform tree";
    }
    return undefined;
  }

  subscribeToPointCloud(
    deviceId: string,
    source: UniverseDataSource,
    callback: (data: IUniversePointCloud | DataStatus) => void
  ): () => void {
    const intervaluHandle = setInterval(() => {
      callback(clone(pointCloud as unknown as IUniversePointCloud));
    }, 1000);
    return () => clearInterval(intervaluHandle);
  }

  subscribeToGeometry(
    _deviceId: string,
    _source: UniverseDataSource,
    callback: (data: IMarker3DArray | DataStatus) => void
  ): () => void {
    callback({
      markers: [...Array(100).keys()].map(() => ({
        id: Math.random(),
        ns: `cube${Math.random()}`,
        type: 1,
        action: 0,
        lifetime: 100000,
        frame_id: "base_link",
        points: [],
        text: "",
        mesh_resource: "",
        frame_locked: false,
        mesh_use_embedded_materials: false,
        color: { r: 1, g: 1, b: 1, a: 0.4 },
        colors: [],
        pose: {
          position: {
            x: 20 * Math.random() - 10,
            y: 20 * Math.random() - 10,
            z: 0,
          },
          orientation: {
            x: 0,
            y: 0,
            z: 0,
            w: 1,
          },
        },
        scale: {
          x: 0.1,
          y: 0.1,
          z: 0.1,
        },
      })),
    });
    return () => {};
  }

  subscribeToJointState(
    _deviceId: string,
    _source: UniverseDataSource,
    callback: (data: IJointState | DataStatus) => void
  ): () => void {
    if (_deviceId === SPOT_ID) {
      window.setInterval(() => {
        callback({
          name: [
            "fl.hx",
            "fl.hy",
            "fl.kn",
            "fr.hx",
            "fr.hy",
            "fr.kn",
            "hl.hx",
            "hl.hy",
            "hl.kn",
            "hr.hx",
            "hr.hy",
            "hr.kn",
          ],
          position: [
            0,
            Math.sin(this.time / 1000),
            Math.cos(this.time / 1000),

            0,
            Math.cos(this.time / 1000),
            Math.sin(this.time / 1000),

            0,
            Math.sin(this.time / 1000),
            Math.cos(this.time / 1000),

            0,
            Math.cos(this.time / 1000),
            Math.sin(this.time / 1000),
          ],
        });
      }, 60 / 12);
    } else if (_deviceId === ARM1_ID) {
      window.setInterval(() => {
        callback({
          name: [
            "joint_1",
            "joint_2",
            "joint_3",
            "joint_4",
            "joint_5",
            "joint_6",
          ],
          position: [
            Math.sin(this.time / 1000 / 3),
            Math.cos(this.time / 1000 / 3),
            Math.sin(this.time / 1000 / 3),
            Math.cos(this.time / 1000 / 3),
            Math.sin(this.time / 1000 / 3),
            Math.cos(this.time / 1000 / 3),
          ],
        });
      }, 60 / 12);
    } else if (_deviceId === ARM2_ID) {
      window.setInterval(() => {
        callback({
          name: [
            "joint_1",
            "joint_2",
            "joint_3",
            "joint_4",
            "joint_5",
            "joint_6",
          ],
          position: [
            Math.sin(this.time / 1000 / 3),
            Math.sin(this.time / 1000 / 3),
            Math.sin(this.time / 1000 / 3),
            Math.sin(this.time / 1000 / 3),
            Math.sin(this.time / 1000 / 3),
            Math.cos(this.time / 1000 / 3),
          ],
        });
      }, 60 / 12);
    } else if (_deviceId === ARM3_ID) {
      window.setInterval(() => {
        callback({
          name: [
            "joint_1",
            "joint_2",
            "joint_3",
            "joint_4",
            "joint_5",
            "joint_6",
          ],
          position: [
            Math.sin(this.time / 1000 / 3),
            Math.cos(this.time / 1000 / 3),
            Math.cos(this.time / 1000 / 3),
            Math.cos(this.time / 1000 / 3),
            Math.cos(this.time / 1000 / 3),
            Math.cos(this.time / 1000 / 3),
          ],
        });
      }, 60 / 12);
    }
    return () => {};
  }

  subscribeToMap(
    _deviceId: string,
    _source: UniverseDataSource,
    _callback: (data: IMap | DataStatus) => void
  ): () => void {
    return () => {};
  }

  async getTelemetryStreams(deviceId: string): Promise<ITelemetryStream[]> {
    if (deviceId === SPOT_ID) {
      return [
        {
          name: "spotTf",
          configuration: {
            type: "transform tree",
          },
        },
      ];
    }
    return [];
  }

  async getTeleopRosStreams(deviceId: string): Promise<ITelemetryRosStream[]> {
    if (deviceId === SPOT_ID) {
      return [
        {
          topicType: "sensor_msgs/JointState",
          topicName: "spotJoints",
        },
        {
          topicType: "visualization_msgs/MarkerArray",
          topicName: "spotMarkers",
        },
      ];
    }
    return [
      {
        topicType: "sensor_msgs/JointState",
        topicName: "armJoints",
      },
    ];
  }

  async getUrdfs(_deviceId: string): Promise<string[]> {
    return ["https://formant-3d-models.s3.us-west-2.amazonaws.com/arm.zip"];
  }

  async getHardwareStreams(_deviceId: string): Promise<IRealtimeStream[]> {
    return [];
  }

  subscribeToTransformTree(
    deviceId: string,
    _source: UniverseDataSource,
    callback: (data: ITransformNode | DataStatus) => void
  ): () => void {
    if (deviceId === SPOT_ID) {
      callback({
        url: "https://formant-3d-models.s3.us-west-2.amazonaws.com/spotjoint_sit.json",
      });
    }
    return () => {};
  }

  subscribeToLocation(
    deviceId: string,
    source: UniverseDataSource,
    callback: (data: ILocation | DataStatus) => void
  ): () => void {
    const myRNG = seedrandom(`${deviceId}`);
    let direction = 1; // start moving forward along the spline
    let t = 0; // start at the beginning of the spline
    const randomPoints: ILocation[] = [];
    for (let i = 0; i < 4; i += 1) {
      randomPoints.push({
        latitude: Number(45.523064) + myRNG.quick() * 0.0004 - 0.0002,
        longitude: Number(-122.676483) + myRNG.quick() * 0.0004 - 0.0002,
      });
    }
    const splinePoints: Vector2[] = randomPoints.map(
      (point) => new Vector2(point.latitude, point.longitude)
    );
    const spline = new SplineCurve(splinePoints);
    const handle = setInterval(() => {
      const point = spline.getPointAt(t);
      callback({ latitude: point.x, longitude: point.y });

      // move to the next point on the spline
      t += 0.01 * direction;
      if (t >= 1 || t <= 0) {
        direction *= -1;
        t += 0.01 * direction;
      }
    }, 1000);

    return () => {
      // cleanup subscription
      clearInterval(handle);
    };
  }
}
