import { Mesh, MeshBasicMaterial, PlaneGeometry, Texture } from "three";
import * as uuid from "uuid";
import { defined, UniverseDataSource } from "@formant/universe-core";
import { UniverseLayer } from "./UniverseLayer";
import { ILocation } from "../main";

const mapBoxConfig = {
  username: "mapbox",
  styleId: "satellite-v9",
  width: 500,
  height: 500,
  bearing: 0,
  accessToken:
    "pk.eyJ1IjoiYWJyYWhhbS1mb3JtYW50IiwiYSI6ImNrOWVuazlhbTAwdDYza203b2tybGZmNDMifQ.Ro6iNGYgvpDO4i6dcxeDGg",
};

export class MapLayer extends UniverseLayer {
  static layerTypeId = "map";

  static commonName = "Map";

  static description = "A plane showing satellite data";

  static usesData = true;

  loaded: boolean = false;

  texture?: Texture;

  mesh?: Mesh;

  location?: ILocation;

  zoomLevel: number = 15;

  init() {
    const source: UniverseDataSource = {
      id: uuid.v4(),
      sourceType: "telemetry",
      streamName: "location?",
      streamType: "location",
    };
    this.universeData.subscribeToLocation(
      defined(this.getLayerContext()?.deviceId),
      source,
      (newLoc: ILocation | Symbol) => {
        if (typeof newLoc === "symbol") {
          throw new Error("unhandled data status");
        } else if (!this.location && "latitude" in newLoc) {
          this.location = newLoc;
          this.onData();
        }
      }
    );
  }

  onData = () => {
    const { username, styleId, width, height, bearing, accessToken } =
      mapBoxConfig;

    this.texture = new Texture();

    const mapImageUrl = `https://api.mapbox.com/styles/v1/${username}/${styleId}/static/${this.location?.longitude.toFixed(
      4
    )},${this.location?.latitude.toFixed(4)},${
      this.zoomLevel
    },${bearing}/${width}x${height}@2x?access_token=${accessToken}`;
    fetch(mapImageUrl)
      .then((response) => response.blob())
      .then((blob) => {
        const img = new Image();

        img.src = URL.createObjectURL(blob);

        img.onload = () => {
          if (this.texture) {
            this.texture.image = img;
            URL.revokeObjectURL(img.src);
            this.texture.needsUpdate = true;
          } else {
            throw new Error("error initializing texture");
          }
        };
      });

    const material = new MeshBasicMaterial({
      map: this.texture,
    });
    const geometry = new PlaneGeometry(5, 5, 100, 100);
    this.mesh = new Mesh(geometry, material);

    this.add(this.mesh);
  };
}
