import { FormantColors } from "../utils/FormantColors";

export function Axis() {
  return (
    <>
      <mesh position={[1, 0, 0]}>
        <boxGeometry args={[1000, 0.01, 0.01]} />
        <meshStandardMaterial color={FormantColors.red} />
      </mesh>
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[0.01, 1000, 0.01]} />
        <meshStandardMaterial color={FormantColors.green} />
      </mesh>
      <mesh position={[0, 0, 1]}>
        <boxGeometry args={[0.01, 0.01, 20]} />
        <meshStandardMaterial color={FormantColors.blue} />
      </mesh>
    </>
  );
}
