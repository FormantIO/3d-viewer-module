import { DataVisualizationLayer } from "./DataVisualizationLayer";
import { IUniverseLayerProps } from "./types";
import { LayerType } from "./common/LayerTypes";
import {
  CloseSubscription,
  defined,
  IJointState,
  UniverseDataSource,
} from "@formant/universe-core";
import { UniverseDataContext } from "./common/UniverseDataContext";
import { useContext, useEffect, useState } from "react";
import { LayerContext } from "./common/LayerContext";
import JSZip from "jszip";
import { Urdf } from "./objects/Urdf";
import { Group } from "three";
import { Fleet } from "@formant/data-sdk";

async function loadURDFIntoBlob(zipPath: string): Promise<string | false> {
  const data = await fetch(zipPath).then((_) => _.arrayBuffer());
  const zipFile = await JSZip.loadAsync(data);
  // find a root urdf file
  const urdfRoot = Object.keys(zipFile.files).find((_) =>
    _.toLowerCase().endsWith("urdf")
  );
  if (urdfRoot) {
    // load the urdf as a string
    let urdf = await zipFile.files[urdfRoot].async("string");

    // lets get all the png images and make blob urls for them
    const images = Object.keys(zipFile.files).filter(
      (_) => _.endsWith("png") && _ !== urdfRoot
    );
    // create a map of the images to their urls
    const imageUrls: { [key in string]: string } = {};
    await Promise.all(
      images.map(async (f) => {
        const file = zipFile.files[f];
        const txt = await zipFile.files[file.name].async("arraybuffer");
        imageUrls[f] = URL.createObjectURL(
          new Blob([txt], {
            type: "image/png",
          })
        );
      })
    );

    // for all other files ( should just be models )
    const nonImages = Object.keys(zipFile.files).filter(
      (_) => !_.endsWith(".png") && _ !== urdfRoot
    );
    await Promise.all(
      nonImages.map(async (f) => {
        const file = zipFile.files[f];
        if (!file.dir) {
          let txt = await zipFile.files[file.name].async("string");

          // replace all image references ( non-relative only )
          images.forEach((imageKey) => {
            const keys = imageKey.split("/");
            const key = keys[keys.length - 1];
            txt = txt.replace(
              new RegExp(key, "g"),
              imageUrls[imageKey].replace(`blob:${window.location.origin}/`, "")
            );
          });
          const modelUrl = URL.createObjectURL(
            new Blob([txt], {
              type: "text/plain",
            })
          ).replace(`blob:${window.location.origin}/`, "");
          // replace the reference to the model in the root urdf
          urdf = urdf.replace(new RegExp(`package://${f}`, "g"), modelUrl);

          urdf = urdf.replace(new RegExp(f, "g"), modelUrl);
        }
      })
    );
    // create the urdf blob url
    return URL.createObjectURL(
      new Blob([urdf], {
        type: "text/plain",
      })
    );
  }
  return false;
}

export type URDFLayerProps = IUniverseLayerProps & {
  jointStatesDataSource?: UniverseDataSource;
  realtimeJointStateDataSource?: UniverseDataSource;
  customSource?: string;
};

export function URDFLayer(props: URDFLayerProps) {
  const { children, jointStatesDataSource, realtimeJointStateDataSource } = props;
  const [universeData, liveUniverseData] = useContext(UniverseDataContext);
  const layerData = useContext(LayerContext);
  const [loaded, setLoaded] = useState(false);
  const [urdf, setUrdf] = useState<Urdf | undefined>(undefined);

  useEffect(() => {
    if (!layerData) return;
    console.log("customSource", props.customSource);
    const { deviceId } = layerData;
    let unsubscribe: CloseSubscription | undefined;

    if (realtimeJointStateDataSource && urdf) {
      unsubscribe = liveUniverseData.subscribeToJointState(
        deviceId,
        realtimeJointStateDataSource,
        (data) => {

          if (typeof data === "symbol") return;

          const jointStates = data as IJointState;
          if (urdf) {
            urdf.jointState = jointStates;
          }
        }
      );
    } else if (jointStatesDataSource && urdf) {
      unsubscribe = universeData.subscribeToJointState(
        deviceId,
        jointStatesDataSource,
        (data) => {
          if (typeof data === "symbol") return;

          const jointStates = data as IJointState;
          if (urdf) {
            urdf.jointState = jointStates;
          }
        }
      );
    }
    if (!urdf) {
      if (props.customSource) {
        Fleet.getFileUrl(props.customSource).then((blobUrl) => {
          loadURDFIntoBlob(blobUrl)
            .then((blobUrl) => {
              if (blobUrl !== false) {
                const urdf = new Urdf(
                  blobUrl,
                  {
                    ghosted: false,
                  },
                  () => {
                    setLoaded(true);
                  }
                );
                setUrdf(urdf);
              }
            })
        });
      } else {
        universeData
          .getUrdfs(deviceId)
          .then((_) => {
            if (_.length === 0) {
              console.warn("No URDFs found for device");
              return;
            }
            loadURDFIntoBlob(_[0])
              .then((blobUrl) => {
                if (blobUrl !== false) {
                  const urdf = new Urdf(
                    blobUrl,
                    {
                      ghosted: false,
                    },
                    () => {
                      setLoaded(true);
                    }
                  );
                  setUrdf(urdf);
                }
              })
              .catch((e) => {
                throw e;
              });
          })
          .catch((e) => {
            throw e;
          });
      }
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [layerData, universeData, urdf]);

  return (
    <DataVisualizationLayer
      {...props}
      type={LayerType.TRACKABLE}
      iconUrl="icons/3d_object.svg"
    >
      {urdf && loaded && <primitive object={urdf as Group} />}
      {children}
    </DataVisualizationLayer>
  );
}
