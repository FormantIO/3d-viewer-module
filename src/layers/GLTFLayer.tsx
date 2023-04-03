import { Fleet } from "@formant/data-sdk";
import { useGLTF, useTexture } from "@react-three/drei";
import { useEffect, useState } from "react";
import { DataVisualizationLayer } from "./DataVisualizationLayer";
import { IUniverseLayerProps } from "./types";

interface IGLFTLayer extends IUniverseLayerProps {
  fileId: string;
  scale: number;
}

export function GLTFLayer(props: IGLFTLayer) {
  const { children, fileId, scale } = props;
  const [url, setUrl] = useState("./empty.glb");
  const { scene } = useGLTF(url);

  useEffect(() => {
    (async () => {
      const fileUrl = await Fleet.getFileUrl(fileId);
      setUrl(fileUrl);
    })();
  }, [fileId]);

  return (
    <group name="axis" renderOrder={1}>
      <DataVisualizationLayer {...props} iconUrl="icons/3d_object.svg">
        <group scale={[scale, scale, scale]} rotation={[Math.PI / 2, 0, 0]}>
          <primitive object={scene} />
        </group>
        {children}
      </DataVisualizationLayer>
    </group>
  );
}
