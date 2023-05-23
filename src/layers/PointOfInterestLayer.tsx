import { IUniverseLayerProps } from "./types";
import {
  FC,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
  useCallback,
} from "react";
import { LayerContext } from "./common/LayerContext";
import { Fleet, IDataPoint } from "@formant/data-sdk";
import { App, aggregateByDateFunctions, IStreamData } from "@formant/data-sdk";
import { UniverseTelemetrySource } from "@formant/universe-core";
import { Vector3, Mesh, BufferGeometry, Group } from "three";
import { DataVisualizationLayer } from "./DataVisualizationLayer";
import { useFrame } from "@react-three/fiber";
interface IPointOfInterstLayer extends IUniverseLayerProps {
  dataSource: UniverseTelemetrySource;
}

type Interval = "day" | "week" | "flock";

type PointData = [number, IPosition];

interface IPosition {
  x: number;
  y: number;
  z: number;
}

interface IPeriod {
  startDate: string | Date;
  endDate: string | Date;
}

interface IFlockPeriod {
  currentFlock: IPeriod;
  previousFlock: IPeriod;
}

interface ISnowFlakeData {
  POINTS_TIME: string;
  POINTS_VALUE: string;
}

interface IRow {
  rows: ISnowFlakeData[];
}

const MAX_POINTS_ALLOWED = 100;

const handleFetchJsonDatapoint = async (
  points: [number, string][]
): Promise<PointData[]> => {
  const partitionSize = points.length / 1000;
  const p = [];

  for (let i = 0; i < partitionSize; i++) {
    const s = i * 1000;
    const e = (i + 1) * 1000;
    const currentSlice = points.slice(s, e);
    const response = (
      await Promise.allSettled(currentSlice.map((_) => fetch(_[1])))
    ).map((_) => {
      if (_.status === "fulfilled") {
        return _.value;
      }
      return null;
    });

    const jsonResponse = response
      .filter((_) => _ !== null)
      .map((_) => _?.json());
    const result = await Promise.all(jsonResponse);
    const mergedResult: PointData[] = currentSlice.map((_, idx) => [
      _[0],
      result[idx].pose.pose.position,
    ]);
    p.push(mergedResult);
  }

  return p.flat();
};

const queryAnalytics = async (
  start: string,
  end: string,
  streamName: string,
  deviceId: string
): Promise<PointData[]> => {
  const query = `
  SELECT * FROM JSON_POINTS 
  WHERE NAME_JSON='${streamName}'
  AND DEVICE_ID_JSON='${deviceId}'  
  AND POINTS_TIME BETWEEN '${start}' AND '${end}';`;

  const table: IRow = await Fleet.getAnalyticsRows({
    sqlQuery: query,
    type: "advanced",
  });

  const { rows } = table;

  if (table.rows.length === 0) {
    console.warn("Analytics has not data for the current time period");
    return [];
  }

  const points: [number, string][] = rows
    .slice(0, MAX_POINTS_ALLOWED)
    .map((_) => [new Date(_.POINTS_TIME).getTime(), _.POINTS_VALUE]);

  return await handleFetchJsonDatapoint(points);
};

const queryPoints = async (
  start: string,
  end: string,
  streamName: string,
  deviceId: string,
  type: Interval
): Promise<PointData[]> => {
  let pointsFromAnalytics: PointData[] = [];
  if (["week", "flock"].includes(type)) {
    pointsFromAnalytics = await queryAnalytics(
      start,
      end,
      streamName,
      deviceId
    );
  }
  const points = (await Fleet.queryTelemetry({
    names: [streamName],
    start,
    end,
    types: ["json"],
    deviceIds: [deviceId],
  })) as IStreamData<"json">[];

  if (points.length === 0 || points[0].points.length === 0) {
    App.showMessage("No data in current time interval");
    throw new Error(`No data was fount beteween ${start}, and ${end}`);
  }
  //TODO: HANDLE TAGS
  //DATA COULD CHANGE SHAPE, MAYBE INCLUDE JSON PATH

  const telemtryPoints = points[0].points.slice(0, MAX_POINTS_ALLOWED);
  const fetchDataPoints = await handleFetchJsonDatapoint(telemtryPoints);

  return [...pointsFromAnalytics, ...fetchDataPoints];
};

const PointOfInterstLayer = (props: IPointOfInterstLayer) => {
  const { dataSource } = props;
  const [points, setPoints] = useState<PointData[]>([]);
  const [active, setActive] = useState<number>();
  const [dateInterval, setDateInterval] = useState<Interval>("day");
  const [currentFlock, setCurrentFlock] = useState<IPeriod>();
  const layerData = useContext(LayerContext);
  const [radius, setRadius] = useState(0.09);

  const handleSetActive = useCallback(
    (_: number) => {
      App.sendChannelData("localization-timestamp", _);
      setActive(_);
    },
    [active]
  );

  const pointsLayer = useMemo(() => {
    if (points.length === 0) return [];

    return points.map((_, idx) => (
      <Point
        radius={radius}
        key={idx}
        setActive={() => handleSetActive(_[0])}
        active={active === _[0]}
        position={new Vector3(_[1].x, _[1].y, 0)}
      />
    ));
  }, [points, active, radius]);

  useEffect(() => {
    App.addChannelDataListener("active-date-interval", (e) => {
      setDateInterval(e.data);
    });
  }, []);

  useEffect(() => {
    App.addChannelDataListener("flock-dates", (e: { data: IFlockPeriod }) => {
      if (e.data.currentFlock) {
        setCurrentFlock(e.data.currentFlock);
      }
    });
  }, []);

  useEffect(() => {
    if (dataSource && dataSource.streamName && layerData) {
      let start, end;
      const now = new Date();
      if (dateInterval === "flock") {
        if (!currentFlock) {
          console.error("No flock dates in <PointOfInterestLayer/>");
          return;
        }
        start = new Date(currentFlock.startDate).toISOString();
        end = new Date(currentFlock.endDate).toISOString();
      } else {
        start = aggregateByDateFunctions[dateInterval].start(now).toISOString();
        end = new Date(Date.now()).toISOString();
      }

      queryPoints(
        start,
        end,
        dataSource.streamName,
        layerData?.deviceId,
        dateInterval
      ).then((_) => {
        setPoints([..._]);
      });
    }
  }, [layerData, dataSource, dateInterval]);

  const layerRef = useRef<Group>(null);
  useFrame(({ camera }) => {
    const pointsOfInterest = layerRef.current;
    if (!pointsOfInterest) return;

    const distanceFromCamera = pointsOfInterest.position.distanceTo(
      camera.position
    );
    const scale =
      distanceFromCamera > 70
        ? 1
        : distanceFromCamera > 50
        ? 0.8
        : distanceFromCamera > 40
        ? 0.5
        : 0.3;
    setRadius(scale);
  });

  return (
    <DataVisualizationLayer {...props}>
      <group ref={layerRef}>{pointsLayer}</group>
    </DataVisualizationLayer>
  );
};

interface Ipointprops {
  active: boolean;
  position: Vector3;
  radius: number;
  setActive: () => void;
}

const Point: FC<Ipointprops> = ({ active, position, setActive, radius }) => {
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
      <circleGeometry args={[radius, 32]} />
      <meshBasicMaterial color={active || hovered ? "#F89973" : "#18D2FF"} />
    </mesh>
  );
};

export default PointOfInterstLayer;
