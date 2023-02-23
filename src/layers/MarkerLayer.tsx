import * as THREE from "three";
import { useContext, useEffect, useMemo, useRef } from "react";
import { useFrame, extend } from "@react-three/fiber";
import { DataVisualizationLayer } from "./DataVisualizationLayer";
import { IUniverseLayerProps } from "./types";
import { MarkerMaterial } from "./utils/MarkerMaterial";
extend({ MarkerMaterial });

interface IMarkerLayerProps extends IUniverseLayerProps {}

export function MarkerLayer(props: IMarkerLayerProps) {
  const { children } = props;

  const circleRef = useRef<THREE.Mesh>(null!);
  const arrowRef = useRef<THREE.Mesh>(null!);

  const arrowShape = useMemo(() => {
    const c = new THREE.QuadraticBezierCurve(
      new THREE.Vector2(-0.4, 0.2),
      new THREE.Vector2(0, 0.6),
      new THREE.Vector2(0.4, 0.2)
    );
    const points = c.getPoints(7);
    points.push(new THREE.Vector2(0, 0.8));
    return new THREE.Shape(points);
  }, []);

  const scaleVector = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ camera }, delta) => {
    const circle = circleRef.current;
    const arrow = arrowRef.current;
    if (!circle || !arrow) return;
    circle.scale.setScalar(2);
    arrow.scale.setScalar(2);

    const scaleFactor = 30;

    const scale =
      scaleVector.subVectors(circle.position, camera.position).length() /
      scaleFactor;
    circle.scale.setScalar(scale);
    arrow.scale.setScalar(scale);

    (circle.material as any).uniforms.uTime.value += delta;
    circle.lookAt(camera.position);
  });

  return (
    <DataVisualizationLayer {...props} iconUrl="icons/3d_object.svg">
      <group>
        <mesh ref={arrowRef} name="arrow" rotation={[0, 0, -Math.PI / 2]}>
          <shapeGeometry args={[arrowShape]} />
          <meshStandardMaterial
            color="white"
            emissive="white"
            emissiveIntensity={2}
            toneMapped={false}
          />
        </mesh>
        <mesh name="circle" ref={circleRef}>
          <circleGeometry args={[0.8, 20]} />
          <markerMaterial
            transparent={true}
            side={THREE.FrontSide}
            depthTest={false}
          />
        </mesh>
      </group>

      {children}
    </DataVisualizationLayer>
  );
}
