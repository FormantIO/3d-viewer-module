import { useContext, useEffect, useRef, useState } from "react";
import { IUniverseLayerProps } from "./types";
import { UniverseDataContext } from "./common/UniverseDataContext";
import { LayerContext } from "./common/LayerContext";
import { DataVisualizationLayer } from "./DataVisualizationLayer";
import {
  defined,
  ITransform,
  UniverseTelemetrySource,
} from "@formant/universe-core";
import { transformMatrix } from "./utils/transformMatrix";
import {
  Box3,
  BufferAttribute,
  BufferGeometry,
  CustomBlending,
  MaxEquation,
  Points,
  PointsMaterial,
  ShaderMaterial,
  TextureLoader,
} from "three";
import { IUniversePointCloud } from "@formant/universe-core/dist/types/universe-core/src/model/IUniversePointCloud";
import { Color } from "./utils/Color";
import { useControlsContext } from "./common/ControlsContext";
import { useLoader, useThree } from "@react-three/fiber";
import { FormantColors } from "./utils/FormantColors";

const pcdColors: any = {
  "Device default": ["#FFFFFF", "#FFFFFF"],
  Formant: ["#729fda", "#F89973"],
  "Data blue": ["#00EFC1", "#18D2FF"],
  "Cyber green": ["#FFC794", "#18D2FF"],
  "Firewall red": ["#FFA3A1", "#18D2FF"],
  "Formant blue": ["#18D2FF", "#18D2FF"],
};

interface IPointCloudProps extends IUniverseLayerProps {
  dataSource?: UniverseTelemetrySource;
  decayTime: number;
  color?: string;
  useColors?: boolean;
}

export const PointCloudLayer = (props: IPointCloudProps) => {
  const {
    dataSource,
    decayTime,
    color = "Formant",
    useColors: fullColor,
  } = props;
  const universeData = useContext(UniverseDataContext);
  const layerData = useContext(LayerContext);
  const {
    state: { pointSize },
    updateState,
  } = useControlsContext();

  const circleMap = useLoader(TextureLoader, "./point-circle.png");
  const [obj, setObj] = useState<Points>(new Points());
  const pointMatRef = useRef<ShaderMaterial>();

  useEffect(() => {
    if (!pointMatRef.current) return;
    pointMatRef.current.uniforms.pointScale.value = pointSize;
  }, [pointSize]);
  const [ready, setReady] = useState(false);

  const { scene } = useThree();

  useEffect(() => {
    if (!layerData) return;
    const { deviceId } = layerData;
    updateState({ hasPointCloud: true });

    const color1 = defined(Color.fromString(pcdColors[color][0]));
    const color2 = defined(Color.fromString(pcdColors[color][1]));
    const glColor = (c: Color) => `vec3(${c.h}, ${c.s}, ${c.l})`;

    const vertexShader = `
    varying vec3 vColor;
    uniform float pointScale;
    uniform float radius;
    uniform float intensityMin;
    uniform float intensityMax;
    uniform float formantColors;
    uniform float density;
    
    float map(float value, float min1, float max1, float min2, float max2) {
        return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
    }
    
    vec3 hslToRgb(vec3 c)
    {
        vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
        vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
        return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
    }
    
    void main() {
        
        float cameraDistance = distance(position, cameraPosition);
        float redShift = (radius - cameraDistance) / radius / 2.0;
        float q = pow(pointScale, 3.0) / (distance(position, cameraPosition) * density);
        float intensity = ((color.r * 65025.0) + (color.g * 255.0) + color.b) / 65025.0;
        float minLuminocity = 0.5;
        float maxLuminocity = 2.0;
    
        // map compress intensity dynamic range to 0.5 - 2.0
        float intensityNormalized = intensityMin != intensityMax ? map(intensity, intensityMin, intensityMax, minLuminocity, maxLuminocity) : 1.0;
        
        vec3 color1 = ${glColor(color1)};
        vec3 color2 = ${glColor(color2)};
    
        // set luminocity to compressed intensity
        color1.b = intensityNormalized;
        color2.b = intensityNormalized;
    
        color1 = hslToRgb(color1);
        color2 = hslToRgb(color2);
    
        // apply red shift

        if (formantColors == 1.0) {
          vColor = mix(color1, color2, clamp(-redShift, 0.0, 1.0));
        } else {
          vColor = vec3(color.r, color.g, color.b);
        }

        gl_PointSize = clamp(50.0 * q, 2.0 / density, 100.0);
    
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1);
    }`;

    const fragmentShader = `
    uniform sampler2D pointCloudTexture;
    varying vec3 vColor;
    
    void main() {  
        gl_FragColor = vec4(vColor, 1) * texture2D(pointCloudTexture, gl_PointCoord);
    }`;

    const pointMat = new ShaderMaterial({
      blendEquation: MaxEquation,
      blending: CustomBlending,
      depthTest: false,
      vertexShader,
      fragmentShader,
      uniforms: {
        pointCloudTexture: { value: circleMap },
        pointScale: { value: 1.0 },
        radius: { value: 1.0 },
        intensityMin: { value: 0.0 },
        intensityMax: { value: 0.0 },
        formantColors: { value: fullColor ? 0.0 : 1.0 },
        density: { value: 1.0 },
      },
      transparent: true,
      vertexColors: true,
    });
    pointMatRef.current = pointMat;

    const deviceMat = new PointsMaterial({ vertexColors: true, size: 0.1 });

    const geometry = new BufferGeometry();

    const points = new Points(
      geometry,
      color === "Device Default" ? deviceMat : pointMat
    );
    points.frustumCulled = false;
    setObj(points);

    let timer: number = 0;
    let isReady = false;
    if (dataSource) {
      const unsubscribe = universeData.subscribeToPointCloud(
        deviceId,
        dataSource,
        (data: IUniversePointCloud | Symbol) => {
          if (typeof data === "symbol") return;

          points.visible = true;

          if (timer) clearTimeout(timer);

          timer = window.setTimeout(() => {
            points.visible = false;
          }, decayTime * 1000);

          const pc = data as IUniversePointCloud;
          const { header, positions, colors } = defined(pc.pcd);
          const identityTransform: ITransform = {
            translation: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0, w: 1 },
          };
          const worldToLocal = pc.worldToLocal
            ? pc.worldToLocal
            : identityTransform;

          if (positions && positions.length > 0) {
            geometry.setAttribute(
              "position",
              new BufferAttribute(new Float32Array(positions), 3)
            );

            geometry.setAttribute(
              "color",
              new BufferAttribute(new Float32Array(colors!), 4)
            );

            let intensityMin = 0;
            let intensityMax = 0;

            if (colors !== undefined && colors.length > 0) {
              for (let i = 0; i < colors.length; i += 4) {
                const value =
                  (colors[i] * 65025 + colors[i + 1] * 255 + colors[i + 2]) /
                  65025;
                intensityMin = Math.min(value, intensityMin);
                intensityMax = Math.max(value, intensityMax);
              }
            }

            geometry.computeBoundingSphere();

            if (!isReady) {
              isReady = true;
              setReady(true);
              geometry.computeBoundingBox();
              scene.dispatchEvent({ type: "updateBounds" });
            }

            const numPoints = positions?.length || 0;
            const radius = geometry.boundingSphere
              ? geometry.boundingSphere.radius
              : 0;
            const clampedRadius = radius > 50 ? 50 : radius;
            const volume = (4 / 3) * Math.PI * Math.pow(clampedRadius, 3);
            const density = Math.pow(numPoints / (volume || 1), 0.3333);

            pointMat.uniforms.intensityMin.value = intensityMin;
            pointMat.uniforms.intensityMax.value = intensityMax;
            pointMat.uniforms.radius.value = radius;
            pointMat.uniforms.density.value = density;
            pointMat.needsUpdate = true;

            points.matrixAutoUpdate = false;
            points.matrix.copy(transformMatrix(worldToLocal));
          }
        }
      );

      return () => {
        unsubscribe();
      };
    }
  }, [layerData, universeData, color]);

  return (
    <DataVisualizationLayer {...props} iconUrl="icons/3d_object.svg">
      {ready && <primitive object={obj} />}
    </DataVisualizationLayer>
  );
};
