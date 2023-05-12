import { Object3DNode } from "@react-three/fiber";
import {
  BufferAttribute,
  BufferGeometry,
  CatmullRomCurve3,
  Vector3,
} from "three";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      pathGeometry: Object3DNode<PathGeometry, typeof PathGeometry>;
    }
  }
}

export class PathGeometry extends BufferGeometry {
  constructor(pts: Vector3[], width: number, segments: number = 200) {
    super();

    const ls = segments * 10; // length segments
    const ws = 4; // width segments

    const lss = ls + 1;
    const wss = ws + 1;
    const faceCount = ls * ws * 2;
    const vertexCount = lss * wss;

    const indexArr = new Uint32Array(faceCount * 3);
    const posArr = new Float32Array(vertexCount * 3);

    var curve = new CatmullRomCurve3(pts);
    const points = curve.getPoints(ls);

    let indexCount = 0;

    for (var j = 0; j < ls; j++) {
      for (var i = 0; i < ws; i++) {
        const a = wss * j + i;
        const b1 = wss * (j + 1) + i; // right-bottom
        const c1 = wss * (j + 1) + 1 + i;
        const b2 = wss * (j + 1) + 1 + i; // left-top
        const c2 = wss * j + 1 + i;

        indexArr[indexCount] = a; // right-bottom
        indexArr[indexCount + 1] = b1;
        indexArr[indexCount + 2] = c1;

        indexArr[indexCount + 3] = a; // left-top
        indexArr[indexCount + 4] = b2;
        indexArr[indexCount + 5] = c2;

        // write groups for multi material
        this.addGroup(indexCount, 6, i);

        indexCount += 6;
      }
    }

    const normal = new Vector3(0, 0, 0);
    const binormal = new Vector3(0, 0, -1);

    let vIdx = 0;
    let posIdx = 0;

    const d = [
      -width / 2,
      -width / 2 + width / 60,
      -width / 120,
      width / 120,
      width / 2 - width / 60,
      width / 2,
    ];

    for (var j = 0; j < lss; j++) {
      // length
      for (var i = 0; i < wss; i++) {
        const tangent = curve.getTangent(j / ls);
        normal.crossVectors(tangent, binormal);
        binormal.crossVectors(normal, tangent);
        normal.normalize();

        const x = points[j].x + d[i] * normal.x;
        const y = points[j].y + d[i] * normal.y;
        const z = points[j].z;

        posIdx = vIdx * 3;
        posArr[posIdx] = x;
        posArr[posIdx + 1] = y;
        posArr[posIdx + 2] = z;
        vIdx++;
      }
    }
    this.setAttribute("position", new BufferAttribute(posArr, 3));
    this.setIndex(new BufferAttribute(indexArr, 1));
    this.computeVertexNormals();
  }
}
