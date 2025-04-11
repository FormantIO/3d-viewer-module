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
  IPose,
  IUniverseData,
  IUniverseGridMap,
  IUniverseOdometry,
  IUniversePointCloud,
  IUniversePath,
  IBitset,
  IJointState,
  ILocation,
  IMap,
  IMarker3DArray,
  INumericSetEntry,
  ITransform,
  ITransformNode,
  IColorRGBA,
  IVector3,
  IQuaternion,
} from "@formant/data-sdk";
import { Quaternion, SplineCurve, Vector2, Vector3 } from "three";
import seedrandom from "seedrandom";
import { pointCloud, occupancyMap } from "./exampleData";
import { clone } from "../../common/clone";

export const SPOT_ID = "abc";
export const ARM1_ID = "asdfadsfas";
export const ARM2_ID = "124fasd";
export const ARM3_ID = "77hrtesgdafdsh";

// Helper types from visualization code (or define inline if needed)
type MarkerType =
  | "arrow" // 0
  | "cube" // 1
  | "sphere" // 2
  | "cylinder" // 3
  | "line_strip" // 4
  | "line_list" // 5
  | "cube_list" // 6
  | "sphere_list" // 7
  | "points" // 8
  | "text" // 9
  | "mesh_resource" // 10 (skipped)
  | "triangle_list"; // 11

const typeIdMap: { [key: number]: MarkerType } = {
  0: "arrow",
  1: "cube",
  2: "sphere",
  3: "cylinder",
  4: "line_strip",
  5: "line_list",
  6: "cube_list",
  7: "sphere_list",
  8: "points",
  9: "text",
  11: "triangle_list",
};

const typeNameToId = Object.fromEntries(
  Object.entries(typeIdMap).map(([k, v]) => [v, parseInt(k)])
);

// Helper functions for test data generation
const randomColor = (alpha: number = 1): IColorRGBA => ({
  r: Math.random(),
  g: Math.random(),
  b: Math.random(),
  a: alpha,
});
const randomVector = (factor: number = 1): IVector3 => ({
  x: (Math.random() - 0.5) * 2 * factor,
  y: (Math.random() - 0.5) * 2 * factor,
  z: (Math.random() - 0.5) * 2 * factor,
});
const randomScale = (factor: number = 1): IVector3 => ({
  x: Math.random() * factor + 0.1, // Avoid zero scale
  y: Math.random() * factor + 0.1,
  z: Math.random() * factor + 0.1,
});
const randomQuaternion = (): IQuaternion => {
  const u = Math.random();
  const v = Math.random();
  const w = Math.random();
  return {
    x: Math.sqrt(1 - u) * Math.sin(2 * Math.PI * v),
    y: Math.sqrt(1 - u) * Math.cos(2 * Math.PI * v),
    z: Math.sqrt(u) * Math.sin(2 * Math.PI * w),
    w: Math.sqrt(u) * Math.cos(2 * Math.PI * w),
  };
};
const generatePoints = (count: number): IVector3[] =>
  Array.from({ length: count }, () => randomVector(0.5));

const generateColors = (count: number): IColorRGBA[] =>
  Array.from({ length: count }, () => randomColor());

export class ExampleUniverseData implements IUniverseData {
  subscribeToBitset(
    _deviceId: string,
    _source: UniverseDataSource,
    _callback: (data: Symbol | IBitset) => void
  ): CloseSubscription {
    throw new Error("Method not implemented.");
  }
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

  clearWorkerPool(): void {}

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
              z: -2.154354741654536,
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
    const radius = 2; // Radius of the circular path
    const frequency = 0.5; // Controls the speed of movement

    const interval = setInterval(() => {
      const _time = time;
      time += 0.2; // Increment time
      // Calculate x and y coordinates in a circular path with some randomness
      const x = (radius + Math.cos(time * frequency)) * Math.cos(time);
      const y = (radius + Math.sin(time * frequency)) * Math.sin(time);

      const _x = (radius + Math.cos(_time * frequency)) * Math.cos(_time);
      const _y = (radius + Math.sin(_time * frequency)) * Math.sin(_time);

      const quaternion = new Quaternion();
      // calculate from _x, _y to x, y
      const direction = new Vector2(x - _x, y - _y);
      const angle = Math.atan2(direction.y, direction.x);
      quaternion.setFromAxisAngle(new Vector3(0, 0, 1), angle);

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
            x: quaternion.x,
            y: quaternion.y,
            z: quaternion.z,
            w: quaternion.w,
          },
        },
        covariance: [],
      });
    }, 1200); // Reduced interval for smoother movement

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

  getTime(): Date | "live" {
    return new Date(this.time);
  }

  getTimeMs(): number {
    return this.time;
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
    const intervalHandle = setInterval(() => {
      callback(clone(pointCloud as unknown as IUniversePointCloud));
    }, 1000);
    return () => clearInterval(intervalHandle);
  }

  subscribeToGeometry(
    _deviceId: string,
    _source: UniverseDataSource,
    callback: (data: IMarker3DArray | DataStatus) => void
  ): () => void {
    let tick = 0;
    const updateInterval = 500; // ms between updates
    const phaseLength = 20; // ticks per phase (10 seconds)
    let nextId = 0;

    // Store active markers: Map<namespace, Map<id, markerData>>
    const activeMarkers = new Map<string, Map<number, any>>();

    const addOrUpdateMarker = (marker: any) => {
      let nsMap = activeMarkers.get(marker.ns);
      if (!nsMap) {
        nsMap = new Map<number, any>();
        activeMarkers.set(marker.ns, nsMap);
      }
      nsMap.set(marker.id, marker); // Store the latest version
      // Return a marker object with action: 0 (ADD/MODIFY)
      return { ...marker, action: 0 };
    };

    const deleteMarker = (ns: string, id: number): any | null => {
      const nsMap = activeMarkers.get(ns);
      if (nsMap && nsMap.has(id)) {
        const deletedMarker = { ...nsMap.get(id), action: 2 }; // Create DELETE marker data
        nsMap.delete(id);
        if (nsMap.size === 0) {
          activeMarkers.delete(ns);
        }
        return deletedMarker;
      }
      return null;
    };

    const deleteAllMarkers = (): any[] => {
      const deleteMarkers = [];
      // It's often enough to send a single marker with action: 3
      if (activeMarkers.size > 0) {
        // Pick one existing marker's details if available, otherwise create dummy
        const firstNs = activeMarkers.keys().next().value;
        const firstId = activeMarkers
          .get(firstNs || "")
          ?.keys()
          .next().value;
        if (firstNs && firstId !== undefined) {
          deleteMarkers.push({ ns: firstNs, id: firstId, action: 3 });
        } else {
          // Fallback if no markers exist but we want to signal DELETEALL
          deleteMarkers.push({ ns: "system", id: 0, action: 3 });
        }
      }
      activeMarkers.clear();
      return deleteMarkers;
    };

    const timer = setInterval(() => {
      const time = Date.now();
      const phase = Math.floor(tick / phaseLength);
      const markersToSend: any[] = [];

      // --- Phase Logic ---
      switch (
        phase % 8 // Cycle through 8 phases
      ) {
        case 0: // Initial Creation of diverse types
          console.log("Geo Phase 0: Initial Creation");
          if (tick % phaseLength === 0) {
            // Only add once per phase start
            // Add one of each type
            Object.entries(typeIdMap).forEach(([idStr, typeName], index) => {
              const id = parseInt(idStr);
              if (typeName === "mesh_resource") return; // Skip mesh resource

              const marker: any = {
                id: nextId++,
                ns: `creation_phase_${typeName}`,
                type: id,
                lifetime: 60, // 60 seconds
                frame_id: "map",
                pose: {
                  position: randomVector(5),
                  orientation: randomQuaternion(),
                },
                scale: randomScale(1),
                color: randomColor(index % 3 === 0 ? 0.5 : 1), // Test transparency
                text: typeName,
              };

              // Check typeName validity BEFORE using it for list checks
              if (typeName) {
                const listTypes = [
                  "line_strip",
                  "line_list",
                  "points",
                  "triangle_list",
                  "cube_list",
                  "sphere_list",
                ];

                if (listTypes.includes(typeName)) {
                  // Safe check now
                  let numPoints = 10 + Math.floor(Math.random() * 20);
                  if (typeName === "triangle_list") {
                    // Ensure point count is a multiple of 3 (and at least 3)
                    numPoints = Math.max(3, numPoints - (numPoints % 3));
                  }
                  marker.points = generatePoints(numPoints);
                  if (index % 2 === 0) {
                    marker.colors = generateColors(numPoints);
                  }
                }

                // Arrow specific points (outside listTypes check)
                if (typeName === "arrow") {
                  marker.points = generatePoints(2);
                  marker.scale = { x: 0.1, y: 0.2, z: 0.05 };
                }
                // Text specific scale (outside listTypes check)
                if (typeName === "text") {
                  marker.scale = { x: 1, y: 1, z: 1 };
                }
              }

              markersToSend.push(addOrUpdateMarker(marker));
            });
          }
          break;

        case 1: // Modification
          console.log("Geo Phase 1: Modification");
          activeMarkers.forEach((nsMap, ns) => {
            nsMap.forEach((marker) => {
              // Modify ~20% of markers each tick in this phase
              if (Math.random() < 0.2) {
                const modifiedMarker = { ...marker }; // Copy existing data
                // Change something significant
                modifiedMarker.pose.position.x += (Math.random() - 0.5) * 0.5;
                modifiedMarker.pose.position.y += (Math.random() - 0.5) * 0.5;
                modifiedMarker.color = randomColor(marker.color.a); // Keep original alpha maybe
                if (modifiedMarker.text) {
                  modifiedMarker.text = `Updated: ${Math.random().toFixed(2)}`;
                }
                markersToSend.push(addOrUpdateMarker(modifiedMarker));
              }
            });
          });
          break;

        case 2: // Add More
          console.log("Geo Phase 2: Add More");
          if (tick % 5 === 0) {
            // Add one every few ticks
            const typeId = Math.floor(Math.random() * 11);
            const typeName = typeIdMap[typeId];

            // Check if typeName is valid and not mesh_resource BEFORE using it
            if (typeName && typeName !== "mesh_resource") {
              const marker: any = {
                id: nextId++,
                ns: `added_phase_${typeName}`,
                type: typeId,
                lifetime: 30,
                frame_id: "map",
                pose: {
                  position: randomVector(8),
                  orientation: randomQuaternion(),
                },
                scale: randomScale(0.5),
                color: randomColor(),
                text: `Added ${typeName}`,
              };

              // Now typeName is guaranteed to be a valid string here
              if (
                [
                  "line_strip",
                  "line_list",
                  "points",
                  "triangle_list",
                  "cube_list",
                  "sphere_list",
                ].includes(typeName as string) // Safe to use includes now
              ) {
                marker.points = generatePoints(5);
              }

              // This check is also safe now
              if (typeName === "arrow") {
                marker.points = marker.points || [];
              }

              markersToSend.push(addOrUpdateMarker(marker));
            }
          }
          break;

        case 3: // Deletion - Specific Markers
          console.log("Geo Phase 3: Deletion (Specific)");
          const markersToDelete: { ns: string; id: number }[] = [];
          activeMarkers.forEach((nsMap, ns) => {
            nsMap.forEach((marker, id) => {
              // Delete ~10% of markers each tick in this phase
              if (Math.random() < 0.1) {
                markersToDelete.push({ ns, id });
              }
            });
          });
          markersToDelete.forEach(({ ns, id }) => {
            const deletedMarkerData = deleteMarker(ns, id);
            if (deletedMarkerData) {
              markersToSend.push(deletedMarkerData);
            }
          });
          break;

        case 4: // Re-add a recently deleted one (if possible) or add new
          console.log("Geo Phase 4: Re-add/Add New");
          // Note: This phase is simplistic. A real re-add might need tracking deleted IDs.
          // For now, just add a new one like phase 2.
          if (tick % 5 === 0) {
            // Add one every few ticks
            const typeId = typeNameToId["sphere"]; // Add a sphere
            const typeName = typeIdMap[typeId];
            const marker: any = {
              id: nextId++, // Use a new ID
              ns: `readded_phase_${typeName}`,
              type: typeId,
              lifetime: 30,
              frame_id: "map",
              pose: {
                position: randomVector(3),
                orientation: randomQuaternion(),
              },
              scale: randomScale(1.5),
              color: { r: 0, g: 1, b: 0, a: 1 }, // Green
              text: `Re-added ${typeName}`,
            };
            markersToSend.push(addOrUpdateMarker(marker));
          }
          break;

        case 5: // Modify Lists (Points/Colors)
          console.log("Geo Phase 5: Modify Lists");
          activeMarkers.forEach((nsMap, ns) => {
            nsMap.forEach((marker) => {
              const typeName = typeIdMap[marker.type]; // Could be undefined

              // Check if it's a known type first
              if (typeName) {
                const listTypes = [
                  "line_strip",
                  "line_list",
                  "points",
                  "triangle_list",
                  "cube_list",
                  "sphere_list",
                ];

                // Explicitly check inclusion *after* confirming typeName is a string
                if (listTypes.includes(typeName as string)) {
                  // Modify ~30% of list markers each tick
                  if (Math.random() < 0.3) {
                    const modifiedMarker = { ...marker };
                    // Change number of points or their positions
                    const numPoints = 5 + Math.floor(Math.random() * 15);
                    modifiedMarker.points = generatePoints(numPoints);
                    // Update colors if they existed, or add them
                    if (modifiedMarker.colors || Math.random() < 0.5) {
                      modifiedMarker.colors = generateColors(numPoints);
                    } else {
                      delete modifiedMarker.colors; // Remove colors sometimes
                    }
                    markersToSend.push(addOrUpdateMarker(modifiedMarker));
                  }
                }
              }
            });
          });
          break;

        case 6: // Delete by Namespace (Simulated)
          console.log("Geo Phase 6: Delete Namespace (Simulated)");
          // Choose a namespace to delete (e.g., the first one added in phase 0)
          const nsToDelete = "creation_phase_cube"; // Example
          const nsMapToDelete = activeMarkers.get(nsToDelete);
          if (nsMapToDelete) {
            const idsToDelete = Array.from(nsMapToDelete.keys());
            idsToDelete.forEach((id) => {
              const deletedMarkerData = deleteMarker(nsToDelete, id);
              if (deletedMarkerData) {
                markersToSend.push(deletedMarkerData);
              }
            });
            console.log(`Deleting namespace ${nsToDelete}`);
          }
          break;

        case 7: // Delete All
          console.log("Geo Phase 7: Delete All");
          if (tick % phaseLength === Math.floor(phaseLength / 2)) {
            // Send DELETEALL mid-phase
            markersToSend.push(...deleteAllMarkers());
            console.log("Sent DELETEALL action.");
          }
          break;
      }

      // Add some continuous motion to a specific marker if it exists
      const motionNs = "creation_phase_sphere";
      const motionId = Array.from(activeMarkers.get(motionNs)?.keys() || [])[0]; // Get first ID if ns exists
      if (motionId !== undefined) {
        const marker = activeMarkers.get(motionNs)?.get(motionId);
        if (marker) {
          const modifiedMarker = { ...marker };
          modifiedMarker.pose.position.z = Math.sin(time / 500) * 2; // Bob up and down
          markersToSend.push(addOrUpdateMarker(modifiedMarker));
        }
      }

      // Only send if there are markers to update
      if (markersToSend.length > 0) {
        // Remove duplicates (e.g., if a marker was modified twice)
        // Keep the latest instruction for each unique ns/id combo
        const finalMarkers = new Map<string, any>();
        markersToSend.forEach((m) => {
          finalMarkers.set(`${m.ns}_${m.id}`, m);
        });
        callback({ markers: Array.from(finalMarkers.values()) });
      }

      tick++;
    }, updateInterval);

    // Initial clear state (optional)
    // callback({ markers: deleteAllMarkers() });

    return () => {
      clearInterval(timer);
      console.log("Geometry subscription stopped.");
    };
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
      if (interval) {
        clearInterval(interval);
      }
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
