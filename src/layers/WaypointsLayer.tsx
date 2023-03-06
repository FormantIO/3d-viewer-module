import {
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { IUniverseLayerProps } from "./types";
import { UniverseDataContext } from "./common/UniverseDataContext";
import { LayerContext } from "./common/LayerContext";
import { DataVisualizationLayer } from "./DataVisualizationLayer";
import { IPose, UniverseTelemetrySource } from "@formant/universe-core";
import { Euler, Group, Matrix4, Mesh, Quaternion, Vector3 } from "three";
import { IUniversePointCloud } from "@formant/universe-core/dist/types/universe-core/src/model/IUniversePointCloud";
import { FormantColors } from "./utils/FormantColors";
import { ThreeEvent, useThree } from "@react-three/fiber";
import { Line, PivotControls, Html } from "@react-three/drei";
import { Box, Button } from "@formant/ui-sdk";
import { Checkbox } from "@mui/material";

interface IPointCloudProps extends IUniverseLayerProps {
  dataSource?: UniverseTelemetrySource;
}

type WaypointData = {
  pointIndex: number;
  message: string;
  scrubberOn: boolean;
  pose: IPose;
};

export const WaypointsLayer = (props: IPointCloudProps) => {
  const { dataSource } = props;
  const universeData = useContext(UniverseDataContext);
  const layerData = useContext(LayerContext);

  const [points, setPoints] = useState<IPose[]>([]);

  // For selected waypoint
  const [count, setCount] = useState<number | null>(null);

  // Waypoint Metadata
  const [store] = useState<WaypointData[]>([]);

  useEffect(() => {
    if (!layerData) return;
    const { deviceId } = layerData;

    if (dataSource) {
      dataSource.streamType = "localization";
      const unsubscribe = universeData.subscribeToPointCloud(
        deviceId,
        dataSource,
        (data: IUniversePointCloud | Symbol) => {}
      );

      return () => {
        unsubscribe();
      };
    }
  }, [layerData, universeData]);

  const mouseDownHandler = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      if (!e.shiftKey) {
        setCount(null);
        return;
      }
      let p = e.point;
      setPoints([
        ...points,
        {
          translation: {
            x: p.x,
            y: p.y,
            z: p.z + 0.125,
          },
          rotation: {
            x: 0,
            y: 0,
            z: 0,
            w: 1,
          },
        },
      ]);
    },
    [points, setPoints]
  );

  const plane = useRef<Mesh>(null!);

  return (
    <DataVisualizationLayer {...props} iconUrl="icons/3d_object.svg">
      <group>
        <mesh name="plane" onPointerDown={mouseDownHandler} ref={plane}>
          <planeGeometry args={[200, 200]} />
          <meshStandardMaterial color={FormantColors.green} />
        </mesh>

        <group name="waypoints">
          {points.map((pose: IPose, idx: number) => (
            <Waypoint
              key={idx}
              index={idx}
              pose={pose}
              store={store}
              setCount={setCount}
              selected={count === idx}
              onPose={(updatedPose: IPose) => {
                const newPoints = [...points];
                newPoints[idx] = updatedPose;
                setPoints(newPoints);

                store[idx].pose = updatedPose;
              }}
            />
          ))}

          {points.length > 0 && (
            <Line
              points={points.map(({ translation: { x, y, z } }) => [x, y, z])}
              lineWidth={5}
              color="red"
            />
          )}
        </group>

        {/* {selectedWaypointIdx && (
          <PivotControls object={waypointRefs.current[selectedWaypointIdx]} />
        )} */}
      </group>
    </DataVisualizationLayer>
  );
};

interface Props {
  pose: IPose;
  onPose: (pose: IPose) => void;
  toggle?: boolean;
  store: WaypointData[];
  setCount: (s: number) => void;
  index: number;
  selected: boolean;
}

const Waypoint = forwardRef<Group, Props>((props, ref) => {
  const { pose, index, selected, store, setCount } = props;

  useEffect(() => {
    store[index] = {
      pointIndex: index,
      message: "",
      scrubberOn: false,
      pose,
    };
  }, [store]);

  const [message, setMessage] = useState("");
  const [scrubberOn, setScrubberOn] = useState(false);

  const [hover, setHover] = useState(false);
  const [color, setColor] = useState("white");

  const { controls } = useThree();

  const position = new Vector3(
    pose.translation.x,
    pose.translation.y,
    pose.translation.z
  );
  const rotation = new Euler();
  const pq = new Quaternion();
  pq.set(pose.rotation.x, pose.rotation.y, pose.rotation.z, pose.rotation.w);
  rotation.setFromQuaternion(pq);
  const targetRef = useRef<THREE.Group>(null!);
  const pivotRef = useRef<THREE.Group>(null!);
  const groupRef = useRef<THREE.Group>(null!);
  const matrix = new Matrix4();

  useEffect(() => {
    setColor(hover && !selected ? "red" : selected ? "green" : "white");
  }, [hover, selected, setColor]);

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      <PivotControls
        ref={pivotRef}
        visible={selected}
        lineWidth={4}
        activeAxes={[true, true, false]}
        rotation={[0, 0, Math.PI / 2]}
        offset={[0, 0, 0.1]}
        anchor={[0, 0, 0]}
        scale={20}
        matrix={matrix}
        autoTransform={false}
        onDragStart={() => {
          if (!controls) return;
          (controls as any).enabled = false;
        }}
        onDrag={(m) => {
          matrix.copy(m);
          if (targetRef.current && groupRef.current && pivotRef.current) {
            // get rotation out of matrix
            const targetEuler = new Euler();
            targetEuler.setFromRotationMatrix(matrix);
            // add base rotation
            targetEuler.x += rotation.x;
            targetEuler.y += rotation.y;
            targetEuler.z += rotation.z;
            const n = new Quaternion();
            n.setFromEuler(targetEuler);
            const groupWorldPos = new Vector3();
            const targetWorldPos = new Vector3();
            groupRef.current.getWorldPosition(groupWorldPos);
            targetRef.current.getWorldPosition(targetWorldPos);
            const targetOffset = targetWorldPos.sub(groupWorldPos);

            const currentPose = {
              translation: {
                x: position.x + targetOffset.x,
                y: position.y + targetOffset.y,
                z: position.z + targetOffset.z,
              },
              rotation: {
                x: n.x,
                y: n.y,
                z: n.z,
                w: n.w,
              },
            };
            props.onPose(currentPose);
          }
        }}
      >
        <group ref={targetRef} />
        <group ref={ref}>
          <mesh
            onClick={() => {
              setCount(index);
            }}
            onPointerOver={() => setHover(true)}
            onPointerLeave={() => setHover(false)}
          >
            <coneGeometry args={[4, 15, 32]} />
            <meshBasicMaterial color={color} />
          </mesh>
        </group>
      </PivotControls>

      {selected && (
        <Html
          style={{
            width: "250px",
            color: "#2d2a2a",
            padding: "10px",
            background: "rgba(202, 214, 214, 0.6)",
            borderRadius: "10px",
            margin: "30px",
          }}
        >
          <Box component={"div"} display={"flex"} flexDirection="column">
            <Box component={"div"} mt="10px">
              <label>Message: </label>
              <input
                value={message}
                onChange={(e) => {
                  store[index].message = e.target.value;
                  setMessage(e.target.value);
                }}
              />
            </Box>
            <div>
              <label>Scrubber On</label>
              <Checkbox
                color="primary"
                checked={scrubberOn}
                onChange={(e) => {
                  store[index].scrubberOn = e.target.checked;
                  setScrubberOn(e.target.checked);
                }}
              />
            </div>
            <div>
              <Button
                variant="contained"
                size={"small"}
                color="primary"
                onClick={() => {
                  alert(JSON.stringify(store));
                }}
              >
                Send
              </Button>
            </div>
          </Box>
        </Html>
      )}
    </group>
  );
});
