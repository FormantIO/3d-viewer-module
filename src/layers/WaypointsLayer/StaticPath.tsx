import { IPose } from "@formant/universe-core";
import { MeshProps } from "@react-three/fiber";
import React, { useMemo } from "react";
import { ColorRepresentation, DoubleSide, PlaneGeometry, Vector3 } from "three";

interface PathLineProps extends MeshProps {
  startPoint: Vector3;
  endPoint: Vector3;
  thickness: number;
  color: ColorRepresentation;
  index: number;
}

function PathLine({
  startPoint,
  endPoint,
  thickness,
  color,
  index,
  ...otherProps
}: PathLineProps) {
  const geometry = React.useMemo(() => {
    const distance = startPoint.distanceTo(endPoint);
    const planeGeometry = new PlaneGeometry(distance, thickness, 1, 1);
    const direction = endPoint.clone().sub(startPoint).normalize();
    const midpoint = startPoint.clone().add(endPoint).multiplyScalar(0.5);

    const position = midpoint
      .clone()
      .add(direction.clone().multiplyScalar(thickness / 2));
    const angle = Math.atan2(direction.y, direction.x);
    planeGeometry.rotateZ(angle);
    planeGeometry.translate(position.x, position.y, position.z);
    return planeGeometry;
  }, [startPoint, endPoint, thickness]);

  return (
    <mesh geometry={geometry} {...otherProps} name={index.toString()}>
      <meshBasicMaterial color={color} side={DoubleSide} depthTest={false} />
    </mesh>
  );
}

interface Props extends MeshProps {
  points: IPose[];
  pathWidth: number;
  color: ColorRepresentation;
}

export const StaticPath: React.FC<Props> = ({
  points,
  pathWidth,
  color,
  ...otherProps
}) => {
  if (points.length < 2) return <></>;

  const paths = useMemo(() => {
    const pathArr: Vector3[][] = [];
    for (let i = 0; i < points.length - 1; ++i) {
      const v1 = points[i].translation;
      const v2 = points[i + 1].translation;
      pathArr.push([
        new Vector3(v1.x, v1.y, v1.z),
        new Vector3(v2.x, v2.y, v2.z),
      ]);
    }
    return pathArr;
  }, [points]);

  return (
    <>
      {paths.map(([v1, v2], idx) => (
        <PathLine
          key={idx}
          startPoint={v1}
          endPoint={v2}
          thickness={pathWidth}
          color={color}
          index={idx}
          {...otherProps}
        />
      ))}
    </>
  );
};
