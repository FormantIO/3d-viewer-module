import { Object3DNode } from "@react-three/fiber";
import { Color, ColorRepresentation, ShaderMaterial } from "three";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      pointCloudMaterial: Object3DNode<
        PointCloudMaterial,
        typeof PointCloudMaterial
      >;
    }
  }
}

export class PointCloudMaterial extends ShaderMaterial {
  constructor(
    size: number = 1.0,
    color1: ColorRepresentation,
    color2: ColorRepresentation
  ) {
    super();
    this.uniforms = {
      uTime: { value: 0 },
      size: { value: size },
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
    uniform float size;

    void main(){
        gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);
        vNormal=normalize(normalMatrix*normal);
        vUv=uv;
        vPosition = position;
        gl_PointSize = size;
    }
    `;

    this.fragmentShader = `
    varying vec3 vNormal;
    varying vec2 vUv;
    uniform vec3 color1;
    uniform vec3 color2;
    varying vec3 vPosition;
  
    void main(){  
        // vec3 color = vec3(vPosition.x, 0., 0.); 
        
        vec3 pos = normalize( vPosition);

        float h = pos.x + pos.y + 1.2;

        vec3 color = mix(color1, color2, max( h, 0.0 ) );

        gl_FragColor = vec4(color, 1.0);

    }
    `;
  }
}
