import * as THREE from "three";
import { useMemo, useRef } from "react";
import { useFrame, extend } from "@react-three/fiber";
import { DataVisualizationLayer } from "./DataVisualizationLayer";
import { IUniverseLayerProps, PathType } from "./types";
import { MarkerMaterial } from "./utils/MarkerMaterial";
import { LayerType } from "./common/LayerTypes";
extend({ MarkerMaterial });

interface IMarkerLayerProps extends IUniverseLayerProps {
  trailEnabled?: boolean;
  trailSeconds?: number;
  trailOpacity?: number;
  trailWidth?: number;
  trailType?: PathType;
  trailFlatten?: boolean;
}

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

  useFrame(({ camera }, delta) => {
    const circle = circleRef.current;
    const arrow = arrowRef.current;
    if (!circle || !arrow) return;

    const scaleFactor = 35;
    const circlePosition = circle.getWorldPosition(new THREE.Vector3());
    const distanceFromCamera = camera.position.distanceTo(circlePosition);
    const scale = Math.max(distanceFromCamera, 3.0) / scaleFactor;
    circle.scale.setScalar(scale);
    arrow.scale.setScalar(scale);

    (circle.material as any).uniforms.uTime.value += delta;
    circle.lookAt(camera.position);
  });

  return (
    <DataVisualizationLayer
      {...props}
      type={LayerType.TRACKABLE}
      iconUrl="icons/3d_object.svg"
      trailEnabled={props.trailEnabled}
      trailSeconds={props.trailSeconds}
      trailOpacity={props.trailOpacity}
      trailWidth={props.trailWidth}
      trailType={props.trailType}
      trailFlatten={props.trailFlatten}
    >
      <group >
        <mesh ref={arrowRef} name="arrow" rotation={[0, 0, -Math.PI / 2]} up={new THREE.Vector3(0, 0, 1)} renderOrder={9}>
          <shapeGeometry args={[arrowShape]} />
          <meshStandardMaterial
            color="white"
            emissive="white"
            emissiveIntensity={2}
            toneMapped={false}
            depthTest={true}
          />
        </mesh>
        <mesh name="circle" ref={circleRef} renderOrder={8}>
          <circleGeometry args={[0.8, 20]} />
          <markerMaterial
            transparent={true}
            side={THREE.FrontSide}
            depthTest={false}
            depthWrite={false}
          />
        </mesh>
      </group>

      {children}
    </DataVisualizationLayer>
  );
}
