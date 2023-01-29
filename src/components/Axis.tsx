export function Axis() {
  return (
    <>
      <mesh position={[1, 0, 0]}>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshStandardMaterial color={"red"} />
      </mesh>
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshStandardMaterial color={"green"} />
      </mesh>
      <mesh position={[0, 0, 1]}>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshStandardMaterial color={"blue"} />
      </mesh>
    </>
  );
}
