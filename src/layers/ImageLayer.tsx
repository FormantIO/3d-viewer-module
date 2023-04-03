import { Fleet } from "@formant/data-sdk";
import { useTexture } from "@react-three/drei";
import { useEffect, useState } from "react";
import { DataVisualizationLayer } from "./DataVisualizationLayer";
import { IUniverseLayerProps } from "./types";

interface ImageLayer extends IUniverseLayerProps {
  fileId: string;
  width: number;
  height: number;
}

export function ImageLayer(props: ImageLayer) {
  const { children, fileId, width, height } = props;
  const [url, setUrl] = useState("");
  const texture = useTexture(url || "./transparent.png");

  useEffect(() => {
    (async () => {
      const fileUrl = await Fleet.getFileUrl(fileId);
      setUrl(fileUrl);
    })();
  }, [fileId]);

  return (
    <group name="axis" renderOrder={1}>
      <DataVisualizationLayer {...props} iconUrl="icons/3d_object.svg">
        <mesh>
          <planeGeometry args={[width, height]} />
          <meshBasicMaterial map={texture} transparent />
        </mesh>
        {children}
      </DataVisualizationLayer>
    </group>
  );
}
