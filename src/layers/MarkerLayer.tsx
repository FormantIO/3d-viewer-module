/*import * as THREE from "three";
import { UniverseLayer } from "./UniverseLayer";



export class DeviceDotLayer extends UniverseLayer {
  static layerTypeId = "deviceDot";

  static commonName = "Device Dot";

  static description =
    "Sphere with arrow to represent device location and orientation";

  geo = new THREE.CircleGeometry(0.8, 20);

  mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
    },
    vertexShader: `
    varying vec3 vNormal;
    varying vec2 vUv;

    void main(){
        gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);
        vNormal=normalize(normalMatrix*normal);
        vUv=uv;
    }`,
    fragmentShader: `
    #define M_PI 3.1415926535897932384626433832795
    #define SMOOTH(r,R) (1.0-smoothstep(R-1.0,R+1.0, r))

    varying vec3 vNormal;
    varying vec2 vUv;
    uniform float uTime;

    float ring(vec2 uv, vec2 pos, float innerRad, float outerRad) {
      float aa = 2.0 / 100.;
      return (1.0 - smoothstep(outerRad,outerRad+aa,length(uv-pos))) * smoothstep(innerRad-aa,innerRad,length(uv-pos));
    }

    float circle(vec2 uv, vec2 pos, float rad) {
      return 1.0 - smoothstep(rad,rad+0.005,length(uv-pos));
    }

    float f(float a){
      return a/255.0;
    } 

    float movingLine(vec2 uv, vec2 center, float radius)
    {
        //angle of the line
        float theta0 = 90.0 * uTime;
        vec2 d = uv - center;
        float r = sqrt( dot( d, d ) );
        if(r<radius)
        {
            //compute the distance to the line theta=theta0
            vec2 p = radius*vec2(cos(theta0*M_PI/180.0),
                                -sin(theta0*M_PI/180.0));
            float l = length( d - p*clamp( dot(d,p)/dot(p,p), 0.0, 1.0) );
          d = normalize(d);
            //compute gradient based on angle difference to theta0
          float theta = mod(180.0*atan(d.y,d.x)/M_PI+theta0,360.0);
            float gradient = clamp(1.0-theta/90.0,0.0,1.0);
            return SMOOTH(l,1.0)+0.5*gradient;
        }
        else return 0.0;
    }
    
  
    void main(){
      vec4 white = vec4(1.0);
      vec4 blue = vec4(f(32.0), f(159.0), f(255.0), 0.4 );
      float thickness = 0.25;
      float coreRadius = .05;
      float numOfCircles = 4.;
 

      vec2  uv  = vUv - vec2(0.5);
      float dt = sin(mod(length((vUv - vec2(0.5, 0.5)) * 5.) - uTime, M_PI/ numOfCircles));
      
      vec4 core = white * ring(vUv, vec2(.5), .0, coreRadius * abs(sin(uTime * 1.5))) + movingLine(vUv, vec2(.5), .25) * blue ; 

      vec4 color = vec4(step(dt, thickness)) * blue + core;

      gl_FragColor = color;
    }
    `,
    side: THREE.FrontSide,
    transparent: true,
    depthTest: false
  });

  sphere = new THREE.Mesh(this.geo, this.mat);

  arrowPoints = [
    new THREE.Vector2(-0.4, 0.2),
    new THREE.Vector2(0, 0.8),
    new THREE.Vector2(0.4, 0.2),
    new THREE.Vector2(0, 0.5),
  ];




  arrowGeo = createArrowGeo();// new THREE.ShapeGeometry(new THREE.Shape(this.arrowPoints));

  arrowMat = new THREE.MeshBasicMaterial({side: THREE.DoubleSide});

  arrow = new THREE.Mesh(this.arrowGeo, this.arrowMat);

  scaleVector = new THREE.Vector3();

  init() {
    this.add(this.sphere);
    this.add(this.arrow);
  }

  onUpdate(_delta: number): void {
    const camera = this.getCurrentCamera();
    const scaleFactor = 25;
    const scale =
      this.scaleVector
        .subVectors(this.sphere.position, camera.position)
        .length() / scaleFactor;
    this.sphere.scale.setScalar(scale);
    this.arrow.scale.setScalar(scale);

    this.sphere.material.uniforms.uTime.value += _delta;
    this.sphere.lookAt(camera.position);
  }

  destroy(): void {
    this.geo.dispose();
    this.mat.dispose();
  }
}

*/

function createArrowGeo() {
  const c = new THREE.QuadraticBezierCurve(
    new THREE.Vector2(-0.4, 0.2),
    new THREE.Vector2(0, 0.6),
    new THREE.Vector2(0.4, 0.2)
  );
  const points = c.getPoints(7);
  points.push(new THREE.Vector2(0, 0.8));
  const arrowShape = new THREE.Shape(points);
  return new THREE.ShapeGeometry(arrowShape);
}

import * as THREE from "three";
import { createRoot } from "react-dom/client";
import React, { useContext, useEffect, useRef, useState } from "react";
import { Canvas, ThreeElements, useFrame, useThree } from "@react-three/fiber";
import { IUniverseData } from "@formant/universe-core";
import { TransformLayer } from "./TransformLayer";
import { IUniverseLayerProps } from "./types";
import { UniverseDataContext } from "../UniverseDataContext";

interface IMarkerLayerProps extends IUniverseLayerProps {}

export function MarkerLayer(props: IMarkerLayerProps) {
  const { children } = props;

  const geo = new THREE.CircleGeometry(0.8, 20);

  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
    },
    vertexShader: `
    varying vec3 vNormal;
    varying vec2 vUv;

    void main(){
        gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);
        vNormal=normalize(normalMatrix*normal);
        vUv=uv;
    }`,
    fragmentShader: `
    #define M_PI 3.1415926535897932384626433832795
    #define SMOOTH(r,R) (1.0-smoothstep(R-1.0,R+1.0, r))

    varying vec3 vNormal;
    varying vec2 vUv;
    uniform float uTime;

    float ring(vec2 uv, vec2 pos, float innerRad, float outerRad) {
      float aa = 2.0 / 100.;
      return (1.0 - smoothstep(outerRad,outerRad+aa,length(uv-pos))) * smoothstep(innerRad-aa,innerRad,length(uv-pos));
    }

    float circle(vec2 uv, vec2 pos, float rad) {
      return 1.0 - smoothstep(rad,rad+0.005,length(uv-pos));
    }

    float f(float a){
      return a/255.0;
    } 

    float movingLine(vec2 uv, vec2 center, float radius)
    {
        //angle of the line
        float theta0 = 90.0 * uTime;
        vec2 d = uv - center;
        float r = sqrt( dot( d, d ) );
        if(r<radius)
        {
            //compute the distance to the line theta=theta0
            vec2 p = radius*vec2(cos(theta0*M_PI/180.0),
                                -sin(theta0*M_PI/180.0));
            float l = length( d - p*clamp( dot(d,p)/dot(p,p), 0.0, 1.0) );
          d = normalize(d);
            //compute gradient based on angle difference to theta0
          float theta = mod(180.0*atan(d.y,d.x)/M_PI+theta0,360.0);
            float gradient = clamp(1.0-theta/90.0,0.0,1.0);
            return SMOOTH(l,1.0)+0.5*gradient;
        }
        else return 0.0;
    }
    
  
    void main(){
      vec4 white = vec4(1.0);
      vec4 blue = vec4(f(32.0), f(159.0), f(255.0), 0.4 );
      float thickness = 0.25;
      float coreRadius = .05;
      float numOfCircles = 4.;
 

      vec2  uv  = vUv - vec2(0.5);
      float dt = sin(mod(length((vUv - vec2(0.5, 0.5)) * 5.) - uTime, M_PI/ numOfCircles));
      
      vec4 core = white * ring(vUv, vec2(.5), .0, coreRadius * abs(sin(uTime * 1.5))) + movingLine(vUv, vec2(.5), .25) * blue ; 

      vec4 color = vec4(step(dt, thickness)) * blue + core;

      gl_FragColor = color;
    }
    `,
    side: THREE.FrontSide,
    transparent: true,
    depthTest: false,
  });

  const sphere = new THREE.Mesh(geo, mat);

  const arrowPoints = [
    new THREE.Vector2(-0.4, 0.2),
    new THREE.Vector2(0, 0.8),
    new THREE.Vector2(0.4, 0.2),
    new THREE.Vector2(0, 0.5),
  ];

  const arrowGeo = createArrowGeo(); // new THREE.ShapeGeometry(new THREE.Shape(this.arrowPoints));

  const arrowMat = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });

  const arrow = new THREE.Mesh(arrowGeo, arrowMat);

  const scaleVector = new THREE.Vector3();

  const group = new THREE.Group();
  group.add(sphere);
  group.add(arrow);

  useEffect(() => {
    () => {
      geo.dispose();
      mat.dispose();
    };
  }, []);

  const state = useThree();

  useFrame((state, delta) => {
    const camera = state.camera;
    const scaleFactor = 25;
    const scale =
      scaleVector.subVectors(sphere.position, camera.position).length() /
      scaleFactor;
    sphere.scale.setScalar(scale);
    arrow.scale.setScalar(scale);

    sphere.material.uniforms.uTime.value += delta;
    sphere.lookAt(camera.position);
  });

  return (
    <TransformLayer {...props}>
      <primitive object={group} />
      {children}
    </TransformLayer>
  );
}
