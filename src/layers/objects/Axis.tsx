import { Line } from "@react-three/drei";
import { FormantColors } from "../utils/FormantColors";

export function Axis() {
  const size = 1000;

  return (
    <>
      <Line
        points={[-size, 0, 0, size, 0, 0]}
        color={FormantColors.red}
        opacity={0.4}
        lineWidth={0.8}
        transparent={true}
      />
      <Line
        points={[0, -size, 0, 0, size, 0]}
        color={FormantColors.green}
        opacity={0.4}
        lineWidth={0.8}
        fog={true}
        transparent={true}

      />
      <Line
        points={[0, 0, -size, 0, 0, size]}
        color={FormantColors.blue}
        opacity={0.4}
        lineWidth={0.8}
        depthTest={true}
        fog={true}
        transparent={true}
      />
    </>
  );
}
