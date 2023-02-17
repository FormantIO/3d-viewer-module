import { IQuaternion, ITransform, IVector3 } from "@formant/universe-core";
import { Matrix4, Quaternion, Vector3 } from "three";

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

export const FormantColors = {
  flagship: "#1C1E2D",
  silver: "#BAC4E2",
  white: "white",
  module: "#2D3855",
  steel03: "#657197",
  red: "#EA719D",
  green: "#2EC495",
  blue: "#20A0FF",
  gradient01: ["#FF72CC", "#00E4FF"],
  mapColor: "#1b2541",
  occupiedColor: "#4f5f96",
};
