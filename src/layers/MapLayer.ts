import { Mesh, MeshBasicMaterial, PlaneGeometry, Texture } from 'three';
import * as uuid from 'uuid';
import { defined, UniverseDataSource } from '@formant/universe-core';
import { UniverseLayer } from './UniverseLayer';
import { ILocation } from '../main';

const mapBoxConfig = {
  username: 'mapbox',
  styleId: 'satellite-v9',
  width: 500,
  height: 500,
  bearing: 0,
  accessToken:
    'pk.eyJ1IjoiYWJyYWhhbS1mb3JtYW50IiwiYSI6ImNrOWVuazlhbTAwdDYza203b2tybGZmNDMifQ.Ro6iNGYgvpDO4i6dcxeDGg',
};

export class MapLayer extends UniverseLayer {
  static layerTypeId = 'map';

  static commonName = 'Map';

  static description = 'A plane showing satellite data';

  static usesData = true;

  loaded: boolean = false;

  texture?: Texture;

  mesh?: Mesh;

  location?: ILocation;

  zoomLevel: number = 15;

  static fields = {
    latitude: {
      name: 'Latitude',
      description: '',
      value: 0,
      type: 'number' as const,
      placeholder: 0,
      location: ['create' as const, 'edit' as const],
    },
    longitude: {
      name: 'Longitude',
      description: '',
      value: 0,
      type: 'number' as const,
      placeholder: 0,
      location: ['create' as const, 'edit' as const],
    },
  };

  init() {
    this.location = {
      longitude: defined(this.getField(MapLayer.fields.longitude)),
      latitude: defined(this.getField(MapLayer.fields.latitude)),
    };
    this.onData();
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
            throw new Error('error initializing texture');
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
