import { ITransform, IVector3, IQuaternion } from "@formant/universe-core";
import { Matrix4, Vector3, Quaternion } from "three";

export function transformMatrix({
  translation,
  rotation,
}: ITransform): Matrix4 {
  const vector = ({ x, y, z }: IVector3) => new Vector3(x, y, z);
  const quaternion = ({ x, y, z, w }: IQuaternion) =>
    new Quaternion(x, y, z, w);
  return new Matrix4()
    .multiply(new Matrix4().setPosition(vector(translation)))
    .multiply(new Matrix4().makeRotationFromQuaternion(quaternion(rotation)));
}
