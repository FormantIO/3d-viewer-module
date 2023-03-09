import { Line } from "@react-three/drei";
import { FormantColors } from "../utils/FormantColors";

export function Axis() {
  const size = 1000;

  return (
    <>
      <Line
        points={[0, 0, 0, size, 0, 0]}
        color={FormantColors.red}
        lineWidth={1}
      />
      <Line
        points={[0, 0, 0, 0, size, 0]}
        color={FormantColors.green}
        lineWidth={1}
      />
      <Line
        points={[0, 0, 0, 0, 0, 20]}
        color={FormantColors.blue}
        lineWidth={1}
      />
    </>
  );
}
