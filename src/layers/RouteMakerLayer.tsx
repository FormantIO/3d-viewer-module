import {
  Cylinder,
  GradientTexture,
  Line,
  PivotControls,
} from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Interactive } from "@react-three/xr";
import { useContext, useRef, useState } from "react";
import { FormantColors } from "./utils/FormantColors";
import { DataVisualizationLayer } from "./DataVisualizationLayer";
import { IUniverseLayerProps } from "./types";
import { UIDataContext, useUI } from "./common/UIDataContext";
import { Euler, Group, Matrix4, Quaternion, Vector3 } from "three";
import { IPose } from "@formant/universe-core";

interface IMapLayer extends IUniverseLayerProps {
  size: number;
}

function Marker(props: {
  color: string;
  pose: IPose;
  editable: boolean;
  onPose: (pose: IPose) => void;
}) {
  const { pose, color, editable } = props;
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
  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      <PivotControls
        ref={pivotRef}
        activeAxes={[true, true, false]}
        disableAxes={!editable}
        disableRotations={!editable}
        disableSliders={!editable}
        depthTest={false}
        matrix={matrix}
        autoTransform={false}
        scale={0.5}
        onDrag={(m) => matrix.copy(m)}
        onDragEnd={() => {
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
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <boxGeometry args={[0.25, 0.25, 0.25]} />
          <meshBasicMaterial color={color} />
        </mesh>
      </PivotControls>
    </group>
  );
}

export function RouteMakerLayer(props: IMapLayer) {
  const [points, setPoints] = useState<IPose[]>([]);
  const { children, size } = props;
  const { isEditing } = useContext(UIDataContext);

  return (
    <DataVisualizationLayer {...props}>
      <Interactive
        onSelect={(e) => {
          const p = e.intersection?.point;
          if (p) {
            setPoints([
              ...points,
              {
                translation: {
                  x: p.x,
                  y: p.y,
                  z: p.z,
                },
                rotation: {
                  x: 0,
                  y: 0,
                  z: 0,
                  w: 1,
                },
              },
            ]);
          }
        }}
      >
        <mesh
          position={[0, 0, -0.1]}
          onPointerDown={(e) => {
            if (!isEditing) return;
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
          }}
        >
          <boxGeometry args={[size, size, 0.1]} />
          <meshPhongMaterial opacity={0} transparent />
        </mesh>
      </Interactive>
      {points.map((p: IPose, i) => {
        const v: IPose = p;
        let lastv: IPose | undefined;
        if (i > 0) {
          lastv = points[i - 1];
        }
        return (
          <group key={i}>
            {i > 0 && lastv !== undefined && (
              <Line
                points={[
                  new Vector3(
                    v.translation.x,
                    v.translation.y,
                    v.translation.z
                  ),
                  new Vector3(
                    lastv.translation.x,
                    lastv.translation.y,
                    lastv.translation.z
                  ),
                ]}
                color={FormantColors.silver}
                lineWidth={5}
              />
            )}
            <Marker
              color={i === 0 ? FormantColors.green : FormantColors.silver}
              pose={p}
              editable={isEditing}
              onPose={(updatedPose) => {
                const newPoints = [...points];
                newPoints[i] = updatedPose;
                setPoints(newPoints);
              }}
            />
          </group>
        );
      })}
      {children}
    </DataVisualizationLayer>
  );
}
