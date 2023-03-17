import { Texture } from "three";

export async function loadTexture(url: string) {
  const texture = new Texture();
  const response = await fetch(url);
  const blob = await response.blob();
  const img = new Image();
  img.src = URL.createObjectURL(blob);
  await new Promise((resolve, reject) => {
    img.onload = () => {
      resolve(true);
    };
    img.onerror = () => {
      reject(false);
    };
  });
  texture.image = img;
  URL.revokeObjectURL(img.src);
  texture.needsUpdate = true;
  return texture;
}
