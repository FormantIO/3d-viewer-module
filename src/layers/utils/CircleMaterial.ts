import { Object3DNode } from "@react-three/fiber";
import { Color, ColorRepresentation, ShaderMaterial } from "three";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      circleMaterial: Object3DNode<CircleMaterial, typeof CircleMaterial>;
    }
  }
}

export class CircleMaterial extends ShaderMaterial {
  constructor(color1: ColorRepresentation, color2: ColorRepresentation) {
    super();
    this.uniforms = {
      color1: {
        value: new Color(color1),
      },
      color2: {
        value: new Color(color2),
      },
    };

    this.vertexShader = `
    varying vec3 vNormal;
    varying vec2 vUv;
    varying vec3 vPosition;

    void main(){
        gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);
        vNormal=normalize(normalMatrix*normal);
        vUv=uv;
        vPosition = position;
    }
    `;

    this.fragmentShader = `
    varying vec3 vNormal;
    varying vec2 vUv;
    uniform vec3 color1;
    uniform vec3 color2;
    varying vec3 vPosition;

    float ring(vec2 uv, vec2 pos, float innerRad, float outerRad) {
        float aa = 2.0 / 100.;
        return (1.0 - smoothstep(outerRad,outerRad+aa,length(uv-pos))) * smoothstep(innerRad-aa,innerRad,length(uv-pos));
    }
  
    void main(){  
        vec2 uv = vUv - vec2(0.5);
        float core = ring(vUv, vec2(.5), .0, .45);
        float border = ring(vUv, vec2(.5), .45, .5);
        vec3 color = border * color2 + core * color1 ;
        gl_FragColor = vec4(color, 1.0);
    }
    `;
  }
}
