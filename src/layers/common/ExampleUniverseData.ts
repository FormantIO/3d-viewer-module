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
import { SplineCurve, Vector2, Vector3 } from "three";
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
            y: -2,
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
              x: 2.3545788855933396,
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
          {
            translation: {
              x: -0.545788855933396,
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
    let time = 0;
    const radius = 3; // Radius of the circular path
    const frequency = 0.1; // Controls the speed of movement

    const interval = setInterval(() => {
      time += 0.1; // Increment time
      // Calculate x and y coordinates in a circular path with some randomness
      const x = radius * Math.cos(time * frequency);
      const y = radius * Math.sin(time * frequency);

      callback({
        worldToLocal: {
          translation: {
            x,
            y,
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
            x: x + 3.3545788855933396, // Add an offset for initial position
            y: y - 2.1870991935927204, // Add an offset for initial position
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
    }, 10); // Reduced interval for smoother movement

    // Return function to clear interval when needed
    return () => {
      clearInterval(interval);
    };
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
    const array = [];
    for (let i = 0; i < 10; i += 1) {
      for (let j = 0; j <= 11; j += 1) {
        if (j === 6 || j === 7 || j === 8 || j === 4 || j === 5 || j === 11) {
          // let's skip the lists
          continue;
        }
        array.push({
          id: Math.random(),
          ns: `cube${Math.random()}`,
          type: j,
          action: 0,
          lifetime: 100000,
          frame_id: "base_link",
          points: Array.from({ length: j > 0 ? 100 : 0 }, () => ({
            x: Math.random(),
            y: Math.random(),
            z: Math.random(),
          })),
          text: Math.random().toString(), // random text
          mesh_resource: "",
          frame_locked: false,
          mesh_use_embedded_materials: false,
          color: {
            r: Math.random(),
            g: Math.random(),
            b: Math.random(),
            a: Math.random(),
          },
          colors: Array.from({ length: j > 0 ? 100 : 0 }, () => ({
            r: Math.random(),
            g: Math.random(),
            b: Math.random(),
            a: 1.0,
          })),
          pose: {
            position: {
              x: i - 10,
              y: 5 - j,
              z: 0,
            },
            orientation: {
              x: Math.random(),
              y: Math.random(),
              z: Math.random(),
              w: 1,
            },
          },
          scale: {
            x: Math.random(),
            y: Math.random(),
            z: Math.random(),
          },
        });
      }
    }

    // lets make a grid
    const gridSize = 10;

    // Populate the array with cubes organized in a 10x10x10 grid
    const points = [];
    const pointsTriangle = [];
    const colors = [];

    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        for (let z = 0; z < gridSize; z++) {
          const color = {
            r: x / (gridSize - 1), // Red based on X position
            g: y / (gridSize - 1), // Green based on Y position
            b: z / (gridSize - 1), // Blue based on Z position
            a: 1.0,
          };

          points.push({
            x: (x / (gridSize - 1)) * 10,
            y: (y / (gridSize - 1)) * 10,
            z: (z / (gridSize - 1)) * 10,
          });

          pointsTriangle.push({
            x: (x / (gridSize - 1)) * 10,
            y: (y / (gridSize - 1)) * 10,
            z: (z / (gridSize - 1)) * 10,
          });

          pointsTriangle.push({
            x: (x / (gridSize - 1)) * 10,
            y: ((y - 0.5) / (gridSize - 1)) * 10,
            z: (z / (gridSize - 1)) * 10,
          });

          pointsTriangle.push({
            x: ((x + 0.5) / (gridSize - 1)) * 10,
            y: ((y - 0.5) / (gridSize - 1)) * 10,
            z: (z / (gridSize - 1)) * 10,
          });

          colors.push(color);
        }
      }
    }

    array.push({
      id: 199929,
      ns: `triangle_list${Math.random()}`,
      type: 11, // TRIANGLE_LIST
      action: 0,
      lifetime: 100000,
      frame_id: "base_link",
      points: pointsTriangle,
      text: Math.random().toString(),
      mesh_resource: "",
      frame_locked: false,
      mesh_use_embedded_materials: false,
      color: {
        r: Math.random(),
        g: Math.random(),
        b: Math.random(),
        a: Math.random(),
      },
      colors: colors,
      pose: {
        position: {
          x: 15,
          y: -25,
          z: 0,
        },
        orientation: {
          x: Math.random(),
          y: Math.random(),
          z: Math.random(),
          w: 1,
        },
      },
      scale: {
        x: 1.0,
        y: 1.0,
        z: 1.0,
      },
    });

    array.push({
      id: 114429,
      ns: `line_strip${Math.random()}`,
      type: 4, // LINE_STRIP
      action: 0,
      lifetime: 100000,
      frame_id: "base_link",
      points: points,
      text: Math.random().toString(),
      mesh_resource: "",
      frame_locked: false,
      mesh_use_embedded_materials: false,
      color: {
        r: Math.random(),
        g: Math.random(),
        b: Math.random(),
        a: Math.random(),
      },
      colors: colors,
      pose: {
        position: {
          x: -30,
          y: -30,
          z: 0,
        },
        orientation: {
          x: Math.random(),
          y: Math.random(),
          z: Math.random(),
          w: 1,
        },
      },
      scale: {
        x: 1.0,
        y: 1.0,
        z: 1.0,
      },
    });

    array.push({
      id: 1122329,
      ns: `lines_list${Math.random()}`,
      type: 5, // CUBE_LIST
      action: 0,
      lifetime: 100000,
      frame_id: "base_link",
      points: points,
      text: Math.random().toString(),
      mesh_resource: "",
      frame_locked: false,
      mesh_use_embedded_materials: false,
      color: {
        r: Math.random(),
        g: Math.random(),
        b: Math.random(),
        a: Math.random(),
      },
      colors: colors,
      pose: {
        position: {
          x: -10,
          y: -30,
          z: 0,
        },
        orientation: {
          x: Math.random(),
          y: Math.random(),
          z: Math.random(),
          w: 1,
        },
      },
      scale: {
        x: 1.0,
        y: 1.0,
        z: 1.0,
      },
    });

    array.push({
      id: 113329,
      ns: `point_list${Math.random()}`,
      type: 8, // POINTS
      action: 0,
      lifetime: 100000,
      frame_id: "base_link",
      points: points,
      text: Math.random().toString(),
      mesh_resource: "",
      frame_locked: false,
      mesh_use_embedded_materials: false,
      color: {
        r: Math.random(),
        g: Math.random(),
        b: Math.random(),
        a: Math.random(),
      },
      colors: colors,
      pose: {
        position: {
          x: -30,
          y: -10,
          z: 0,
        },
        orientation: {
          x: Math.random(),
          y: Math.random(),
          z: Math.random(),
          w: 1,
        },
      },
      scale: {
        x: 1.5,
        y: 1.5,
        z: 1.0,
      },
    });

    array.push({
      id: 113378,
      ns: `cube_list${Math.random()}`,
      type: 6, // CUBE_LIST
      action: 0,
      lifetime: 100000,
      frame_id: "base_link",
      points: points,
      text: Math.random().toString(),
      mesh_resource: "",
      frame_locked: false,
      mesh_use_embedded_materials: false,
      color: {
        r: Math.random(),
        g: Math.random(),
        b: Math.random(),
        a: Math.random(),
      },
      colors: colors,
      pose: {
        position: {
          x: -35,
          y: 13,
          z: 0,
        },
        orientation: {
          x: Math.random(),
          y: Math.random(),
          z: Math.random(),
          w: 1,
        },
      },
      scale: {
        x: 0.6,
        y: 0.6,
        z: 0.6,
      },
    });

    array.push({
      id: 113379,
      ns: `sphere_list${Math.random()}`,
      type: 7, // SPHERE_LIST
      action: 0,
      lifetime: 100000,
      frame_id: "base_link",
      points: points,
      text: Math.random().toString(),
      mesh_resource: "",
      frame_locked: false,
      mesh_use_embedded_materials: false,
      color: {
        r: Math.random(),
        g: Math.random(),
        b: Math.random(),
        a: Math.random(),
      },
      colors: colors,
      pose: {
        position: {
          x: 5,
          y: 30,
          z: 0,
        },
        orientation: {
          x: Math.random(),
          y: Math.random(),
          z: Math.random(),
          w: 1,
        },
      },
      scale: {
        x: 0.6,
        y: 0.6,
        z: 0.6,
      },
    });

    array.push({
      id: 113377,
      ns: `cube_list${Math.random()}`,
      type: 6, // CUBE_LIST
      action: 0,
      lifetime: 100000,
      frame_id: "base_link",
      points: Array.from({ length: 1000 }, () => ({
        x: Math.random() * 10,
        y: Math.random() * 10,
        z: Math.random() * 10,
      })),
      text: Math.random().toString(),
      mesh_resource: "",
      frame_locked: false,
      mesh_use_embedded_materials: false,
      color: {
        r: Math.random(),
        g: Math.random(),
        b: Math.random(),
        a: Math.random(),
      },
      colors: Array.from({ length: 1000 }, () => ({
        r: Math.random(),
        g: Math.random(),
        b: Math.random(),
        a: 1.0,
      })),
      pose: {
        position: {
          x: -16,
          y: 13,
          z: 0,
        },
        orientation: {
          x: Math.random(),
          y: Math.random(),
          z: Math.random(),
          w: 1,
        },
      },
      scale: {
        x: 1.0,
        y: 1.0,
        z: 1.0,
      },
    });

    array.push({
      id: 113377,
      ns: `cube_list${Math.random()}`,
      type: 6, // CUBE_LIST
      action: 0,
      lifetime: 100000,
      frame_id: "base_link",
      points: Array.from({ length: 1000 }, () => ({
        x: Math.random() * 10,
        y: Math.random() * 10,
        z: Math.random() * 10,
      })),
      text: Math.random().toString(),
      mesh_resource: "",
      frame_locked: false,
      mesh_use_embedded_materials: false,
      color: {
        r: Math.random(),
        g: Math.random(),
        b: Math.random(),
        a: Math.random(),
      },
      colors: Array.from({ length: 1000 }, () => ({
        r: Math.random(),
        g: Math.random(),
        b: Math.random(),
        a: 1.0,
      })),
      pose: {
        position: {
          x: -16,
          y: 13,
          z: 0,
        },
        orientation: {
          x: Math.random(),
          y: Math.random(),
          z: Math.random(),
          w: 1,
        },
      },
      scale: {
        x: 1.0,
        y: 1.0,
        z: 1.0,
      },
    });

    array.push({
      id: 1337,
      ns: `sphereo_list${Math.random()}`,
      type: 7, // SPHERE_LIST
      action: 0,
      lifetime: 100000,
      frame_id: "base_link",
      points: Array.from({ length: 1000 }, () => ({
        x: Math.random() * 10,
        y: Math.random() * 10,
        z: Math.random() * 10,
      })),
      text: Math.random().toString(),
      mesh_resource: "",
      frame_locked: false,
      mesh_use_embedded_materials: false,
      color: {
        r: Math.random(),
        g: Math.random(),
        b: Math.random(),
        a: Math.random(),
      },
      colors: Array.from({ length: 1000 }, () => ({
        r: Math.random(),
        g: Math.random(),
        b: Math.random(),
        a: 1.0,
      })),
      pose: {
        position: {
          x: 3,
          y: 13,
          z: 0,
        },
        orientation: {
          x: Math.random(),
          y: Math.random(),
          z: Math.random(),
          w: 1,
        },
      },
      scale: {
        x: 1.0,
        y: 1.0,
        z: 1.0,
      },
    });

    callback({
      markers: array,
    });
    return () => {};
  }

  subscribeToJointState(
    _deviceId: string,
    _source: UniverseDataSource,
    callback: (data: IJointState | DataStatus) => void
  ): () => void {
    let interval: string | number | NodeJS.Timeout | null | undefined = null;
    if (_deviceId === SPOT_ID) {
      interval = window.setInterval(() => {
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
      interval = window.setInterval(() => {
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
      interval = window.setInterval(() => {
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
      interval = window.setInterval(() => {
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
    return () => {
      clearInterval(interval);
    };
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
