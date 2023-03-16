import { Line } from "@react-three/drei";
import { FormantColors } from "../utils/FormantColors";

export function Axis() {
  const size = 1000;
  const opacity = 0.4;
  const lineWidth = 0.8;

  return (
    <>
      <Line
        points={[-size, 0, 0, size, 0, 0]}
        color={FormantColors.red}
        opacity={opacity}
        lineWidth={lineWidth}
        transparent={true}
        depthTest={false}
        fog={true}
      />
      <Line
        points={[0, -size, 0, 0, size, 0]}
        color={FormantColors.green}
        opacity={opacity}
        lineWidth={lineWidth}
        depthTest={false}
        fog={true}
        transparent={true}

      />
      <Line
        points={[0, 0, -size, 0, 0, size]}
        color={FormantColors.blue}
        opacity={opacity}
        lineWidth={lineWidth}
        depthTest={false}
        fog={true}
        transparent={true}
      />
    </>
  );
}
