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
import { Fleet } from "@formant/data-sdk";
import { App, aggregateByDateFunctions, IStreamData } from "@formant/data-sdk";
import { UniverseTelemetrySource } from "@formant/universe-core";
import { Vector3, Mesh, BufferGeometry } from "three";
import LoadingIndicator from "../images/loading.png";
import { DataVisualizationLayer } from "./DataVisualizationLayer";
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

const queryPoints = async (
  start: string,
  end: string,
  streamName: string,
  deviceId: string
): Promise<PointData[]> => {
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

  const fetchDataPoints = points[0].points.map((_) => fetch(_[1]));
  const response = await Promise.all(fetchDataPoints);
  const jsonResponse = response.map((_) => _.json());
  const dataPoints = await Promise.all(jsonResponse);

  //Data could change
  //Maybe add param for json path
  const formatData: PointData[] = points[0].points.map((_, idx) => [
    _[0],
    dataPoints[idx].pose.pose.position,
  ]);

  return formatData;
};

const PointOfInterstLayer = (props: IPointOfInterstLayer) => {
  const { dataSource } = props;
  const [points, setPoints] = useState<PointData[]>([]);
  const [active, setActive] = useState<number>();
  const [dateInterval, setDateInterval] = useState<Interval>("day");
  const [currentFlock, setCurrentFlock] = useState<IPeriod>();
  const layerData = useContext(LayerContext);

  const handleSetActive = useCallback(
    (_: number) => {
      App.sendChannelData("localization-timestamp", _);
      setActive(_);
    },
    [active]
  );

  const pointsLayer = useMemo(() => {
    if (points.length === 0) return [];

    return points.map((_) => (
      <Point
        key={_[0]}
        setActive={() => handleSetActive(_[0])}
        active={active === _[0]}
        position={new Vector3(_[1].x, _[1].y, 0)}
      />
    ));
  }, [points, active]);

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
        start = aggregateByDateFunctions[dateInterval].start(now);
        end = new Date(Date.now()).toISOString();
      }
      queryPoints(start, end, dataSource.streamName, layerData?.deviceId).then(
        (_) => setPoints([..._])
      );
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
      <circleGeometry args={[0.09, 32]} />
      <meshBasicMaterial color={active || hovered ? "#F89973" : "#18D2FF"} />
    </mesh>
  );
};

export default PointOfInterstLayer;
