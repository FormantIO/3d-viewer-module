import { forwardRef, useEffect, useRef, useState } from "react";
import { IPose } from "@formant/universe-core";
import { Euler, Group, Matrix4, Mesh, Quaternion, Vector3 } from "three";
import { useThree } from "@react-three/fiber";
import { PivotControls, Html } from "@react-three/drei";
import { Box, Button } from "@formant/ui-sdk";
import { Checkbox } from "@mui/material";

interface Props {
  pose: IPose;
  onPose: (pose: IPose) => void;
  toggle?: boolean;
  store: WaypointData[];
  setCount: (s: number) => void;
  index: number;
  selected: boolean;
}

export type WaypointData = {
  pointIndex: number;
  message: string;
  scrubberOn: boolean;
  pose: IPose;
};

export const Waypoint = forwardRef<Group, Props>((props, ref) => {
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
