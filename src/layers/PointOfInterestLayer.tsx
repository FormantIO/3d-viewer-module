import { Html } from "@react-three/drei";
import { LayerType } from "./common/LayerTypes";
import { DataVisualizationLayer } from "./DataVisualizationLayer";
import { IUniverseLayerProps } from "./types";
import { FC, useContext, useEffect, useMemo, useState, useRef } from "react";
import { UniverseDataContext } from "./common/UniverseDataContext";
import { LayerContext } from "./common/LayerContext";
import { DataSourceBuilder } from "./utils/DataSourceBuilder";
import { Fleet, IDataPoint, INumericSetEntry } from "@formant/data-sdk";
import {
  App,
  aggregateByDateFunctions,
  IStreamData,
  IStreamTypeMap,
} from "@formant/data-sdk";
import { UniverseTelemetrySource } from "@formant/universe-core";
import { Vector3, Mesh, BufferGeometry, Material } from "three";

interface IPointOfInterstLayer extends IUniverseLayerProps {
  dataSource: UniverseTelemetrySource;
}

type Interval = "day" | "week" | "flock";

const queryPoints = async (
  range: "week" | "day",
  streamName: string,
  deviceId: string
) => {
  const now = new Date(Date.now());
  const start = aggregateByDateFunctions[range].start(now);
  const end = new Date(Date.now()).toISOString();

  const points = (await Fleet.queryTelemetry({
    names: [streamName],
    start: (start as Date).toISOString(),
    end,
    types: ["json"],
    deviceIds: [deviceId],
  })) as IStreamData<"json">[];

  if (points.length === 0 || points[0].points.length === 0) {
    App.showMessage("No data in current time interval");
    throw new Error(
      `No data was fount beteween ${start.toISOString()}, and ${end}`
    );
  }
  //TODO: HANDLE TAGS

  const fetchDataPoints = points[0].points.map((_) => fetch(_[1]));
  const response = await Promise.all(fetchDataPoints);
  const jsonResponse = response.map((_) => _.json());
  const dataPoints = await Promise.all(jsonResponse);

  //Data could change
  //Maybe add param for json path
  const formatData = points[0].points.map((_, idx) => [
    _[0],
    dataPoints[idx].pose.pose,
  ]);

  return formatData;
};

const PointOfInterstLayer = (props: IPointOfInterstLayer) => {
  const { children, name, id, treePath, type, dataSource } = props;
  const [points, setPoints] = useState([]);
  const [active, setActive] = useState();
  const [dateInterval, setDateInterval] = useState<Interval>("day");

  const layerData = useContext(LayerContext);

  const pointsLayer = useMemo(() => {
    if (points.length === 0) return [];

    return points.map((_) => (
      <Point
        setActive={() => setActive(_[0])}
        active={active === _[0]}
        position={new Vector3(_[1].position.x, _[1].position.y, 0)}
      />
    ));
  }, [points, active]);

  useEffect(() => {
    App.addChannelDataListener("active-date-interval", (e) => {});
  }, []);

  useEffect(() => {
    App.addChannelDataListener("flock-dates", (e) => {});
  }, []);

  useEffect(() => {
    if (
      dataSource &&
      dataSource.streamName &&
      dateInterval !== "flock" &&
      layerData
    ) {
      queryPoints(
        dateInterval,
        dataSource.streamName,
        layerData?.deviceId
      ).then((_) => setPoints(_));
    }
  }, [layerData, dataSource, dateInterval]);

  return (
    <DataVisualizationLayer {...props}>{pointsLayer}</DataVisualizationLayer>
  );
};

interface Ipointprops {
  active: boolean;
  position: Vector3;
  setActive: () => void;
}

const Point: FC<Ipointprops> = ({ active, position, setActive }) => {
  const meshRef = useRef<Mesh<BufferGeometry>>(null);
  const [hovered, sethover] = useState(false);

  const handleHover = () => {
    if (meshRef.current) {
      document.body.style.cursor = "pointer";
      sethover(true);
    }
  };

  const handleUnhover = () => {
    if (meshRef.current) {
      sethover(false);
      document.body.style.cursor = "auto";
    }
  };

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerOver={handleHover}
      onPointerOut={handleUnhover}
      onClick={setActive}
    >
      <circleGeometry args={[0.09, 32]} /> {/* Radius of 1 and 32 segments */}
      <meshBasicMaterial color={active || hovered ? "#F89973" : "#18D2FF"} />
    </mesh>
  );
};

export default PointOfInterstLayer;
