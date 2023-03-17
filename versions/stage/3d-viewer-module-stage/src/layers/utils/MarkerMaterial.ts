import { Object3DNode } from "@react-three/fiber";
import { ShaderMaterial } from "three";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      markerMaterial: Object3DNode<MarkerMaterial, typeof MarkerMaterial>;
    }
  }
}

export class MarkerMaterial extends ShaderMaterial {
  constructor() {
    super();
    this.uniforms = {
      uTime: { value: 0 },
    };

    this.vertexShader = `
    varying vec3 vNormal;
    varying vec2 vUv;

    void main(){
        gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);
        vNormal=normalize(normalMatrix*normal);
        vUv=uv;
    }
    `;

    this.fragmentShader = `
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
    `;
  }
}
