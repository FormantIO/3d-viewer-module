import {
  IBitset,
  IJointState,
  ILocation,
  IMarker3DArray,
  INumericSetEntry,
  ITransformNode,
  CloseSubscription,
  DataSourceState,
  Interaction,
  IPose,
  IRealtimeStream,
  ITelemetryRosStream,
  ITelemetryStream,
  IUniverseData,
  IUniverseStatistics,
  UniverseDataSource,
  IPcd,
  IUniverseOdometry,
  IUniverseGridMap,
  IUniversePath,
  IUniversePointCloud,
} from "@formant/data-sdk";
export class EmptyUniverseData implements IUniverseData {
  subscribeToBitset(
    deviceId: string,
    source: UniverseDataSource,
    callback: (data: Symbol | IBitset) => void
  ): CloseSubscription {
    throw new Error("Method not implemented.");
  }
  subscribeToPath(
    deviceId: string,
    source: UniverseDataSource,
    callback: (data: Symbol | IUniversePath) => void
  ): CloseSubscription {
    throw new Error("Method not implemented.");
  }

  addInteraction(interaction: Interaction) {
    throw new Error("Method not implemented.");
  }

  removeInteraction(id: string) {
    throw new Error("Method not implemented.");
  }

  clearWorkerPool(): void {
    throw new Error("Method not implemented.");
  }

  getInteractions(): Interaction[] {
    throw new Error("Method not implemented.");
  }

  addInteractionsChangedListener(
    callback: (interactions: Interaction[]) => void
  ): () => void {
    throw new Error("Method not implemented.");
  }

  addInteractionListener(
    callback: (interaction: Interaction) => void
  ): () => void {
    throw new Error("Method not implemented.");
  }

  setTime(time: Date | "live"): void {
    throw new Error("Method not implemented.");
  }

  getTime(): Date | "live" {
    throw new Error("Method not implemented.");
  }

  getTimeMs(): number {
    throw new Error("Method not implemented.");
  }

  getLatestTransformTrees(
    deviceId: string
  ): Promise<{ streamName: string; transformTree: ITransformNode }[]> {
    throw new Error("Method not implemented.");
  }

  getLatestLocations(
    deviceId: string
  ): Promise<{ streamName: string; location: ILocation }[]> {
    throw new Error("Method not implemented.");
  }

  getDeviceContexts(): Promise<{ deviceName: string; deviceId: string }[]> {
    throw new Error("Method not implemented.");
  }

  getDeviceContextName(deviceId: string): Promise<string | undefined> {
    throw new Error("Method not implemented.");
  }

  getTelemetryStreamType(
    deviceId: string,
    streamName: string
  ): Promise<string | undefined> {
    throw new Error("Method not implemented.");
  }

  getTelemetryStreams(deviceId: string): Promise<ITelemetryStream[]> {
    throw new Error("Method not implemented.");
  }

  getTeleopRosStreams(deviceId: string): Promise<ITelemetryRosStream[]> {
    throw new Error("Method not implemented.");
  }

  getUrdfs(deviceId: string): Promise<string[]> {
    throw new Error("Method not implemented.");
  }

  getHardwareStreams(deviceId: string): Promise<IRealtimeStream[]> {
    throw new Error("Method not implemented.");
  }

  subscribeToPointCloud(
    deviceId: string,
    source: UniverseDataSource,
    callback: (data: Symbol | IUniversePointCloud) => void
  ): CloseSubscription {
    throw new Error("Method not implemented.");
  }

  subscribeToOdometry(
    deviceId: string,
    source: UniverseDataSource,
    callback: (data: Symbol | IUniverseOdometry) => void
  ): CloseSubscription {
    throw new Error("Method not implemented.");
  }

  subscribeToPose(
    deviceId: string,
    source: UniverseDataSource,
    callback: (data: Symbol | IPose) => void
  ): CloseSubscription {
    throw new Error("Method not implemented.");
  }

  subscribeToGeometry(
    deviceId: string,
    source: UniverseDataSource,
    callback: (data: Symbol | IMarker3DArray) => void
  ): CloseSubscription {
    throw new Error("Method not implemented.");
  }

  subscribeToJointState(
    deviceId: string,
    source: UniverseDataSource,
    callback: (data: Symbol | IJointState) => void
  ): CloseSubscription {
    throw new Error("Method not implemented.");
  }

  subscribeToGridMap(
    deviceId: string,
    source: UniverseDataSource,
    callback: (data: Symbol | IUniverseGridMap) => void
  ): CloseSubscription {
    throw new Error("Method not implemented.");
  }

  subscribeToVideo(
    deviceId: string,
    source: UniverseDataSource,
    callback: (frame: Symbol | HTMLCanvasElement) => void
  ): CloseSubscription {
    throw new Error("Method not implemented.");
  }

  subscribeToTransformTree(
    deviceId: string,
    source: UniverseDataSource,
    callback: (data: Symbol | ITransformNode) => void
  ): CloseSubscription {
    throw new Error("Method not implemented.");
  }

  subscribeToLocation(
    deviceId: string,
    source: UniverseDataSource,
    callback: (data: Symbol | ILocation) => void
  ): CloseSubscription {
    throw new Error("Method not implemented.");
  }

  subscribeToJson<T>(
    deviceId: string,
    source: UniverseDataSource,
    callback: (data: Symbol | T) => void
  ): CloseSubscription {
    throw new Error("Method not implemented.");
  }

  subscribeToText(
    deviceId: string,
    source: UniverseDataSource,
    callback: (text: string | Symbol) => void
  ): CloseSubscription {
    throw new Error("Method not implemented.");
  }

  subscribeToNumeric(
    deviceId: string,
    source: UniverseDataSource,
    callback: (num: Symbol | [number, number][]) => void
  ): CloseSubscription {
    throw new Error("Method not implemented.");
  }

  subscribeToNumericSet(
    deviceId: string,
    source: UniverseDataSource,
    callback: (entry: Symbol | [number, INumericSetEntry[]][]) => void
  ): CloseSubscription {
    throw new Error("Method not implemented.");
  }

  getStatistics(): Promise<IUniverseStatistics> {
    throw new Error("Method not implemented.");
  }

  subscribeDataSourceStateChange(
    deviceId: string,
    source: UniverseDataSource,
    onDataSourceStateChange?:
      | ((state: Symbol | DataSourceState) => void)
      | undefined
  ): CloseSubscription {
    throw new Error("Method not implemented.");
  }

  subscribeToImage(
    deviceId: string,
    source: UniverseDataSource,
    callback: (image: Symbol | HTMLCanvasElement) => void
  ): CloseSubscription {
    throw new Error("Method not implemented.");
  }

  sendRealtimePose(
    deviceId: string,
    streamName: string,
    pose: IPose
  ): Promise<void> {
    throw new Error("Method not implemented.");
  }

  sendRealtimeBoolean(
    deviceId: string,
    streamName: string,
    value: boolean
  ): Promise<void> {
    throw new Error("Method not implemented.");
  }

  sendRealtimeBitset(
    deviceId: string,
    streamName: string,
    bitset: IBitset
  ): Promise<void> {
    throw new Error("Method not implemented.");
  }

  sendCommand(
    deviceId: string,
    name: string,
    data?: string | undefined
  ): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
