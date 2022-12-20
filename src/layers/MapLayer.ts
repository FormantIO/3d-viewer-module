import { Mesh, MeshBasicMaterial, PlaneGeometry, Texture } from 'three';
import { computeDestinationPoint } from 'geolib';
import { GeolibGeoJSONPoint } from 'geolib/es/types';
import { UniverseLayer } from './UniverseLayer';

const mapBoxConfig = {
  username: 'mapbox',
  styleId: 'satellite-v9',
  width: 1000,
  height: 1000,
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

  location: GeolibGeoJSONPoint = [0, 0];

  distance: number = 50;

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
    size: {
      name: 'Size',
      description: 'Size of the map in meters',
      value: 0,
      type: 'number' as const,
      placeholder: 0,
      location: ['create' as const, 'edit' as const],
    },
  };

  init() {
    this.location = [
      this.getField(MapLayer.fields.longitude) || 0,
      this.getField(MapLayer.fields.latitude) || 0,
    ];
    this.distance = (this.getField(MapLayer.fields.size) || 0) / 2;

    this.onData();
  }

  onData = () => {
    const { username, styleId, width, height, accessToken } = mapBoxConfig;

    this.texture = new Texture();

    // calculate bounding box, given center and distance
    const bearings = {
      north: 0,
      east: 90,
      south: 180,
      west: 270,
    };
    const EARTH_RADIUS_IN_METERS = 6371e3;
    const maxLatitude = computeDestinationPoint(
      this.location,
      this.distance,
      bearings.north,
      EARTH_RADIUS_IN_METERS
    ).latitude.toFixed(8);
    const minLatitude = computeDestinationPoint(
      this.location,
      this.distance,
      bearings.south,
      EARTH_RADIUS_IN_METERS
    ).latitude.toFixed(8);
    const maxLongitude = computeDestinationPoint(
      this.location,
      this.distance,
      bearings.east,
      EARTH_RADIUS_IN_METERS
    ).longitude.toFixed(8);
    const minLongitude = computeDestinationPoint(
      this.location,
      this.distance,
      bearings.west,
      EARTH_RADIUS_IN_METERS
    ).longitude.toFixed(8);

    const mapImageUrl = `https://api.mapbox.com/styles/v1/${username}/${styleId}/static/[${minLongitude},${minLatitude},${maxLongitude},${maxLatitude}]/${width}x${height}?logo=false&access_token=${accessToken}`;
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
    const geometry = new PlaneGeometry(
      this.distance * 2,
      this.distance * 2,
      100,
      100
    );
    this.mesh = new Mesh(geometry, material);
    this.mesh.position.z = -0.001;

    this.add(this.mesh);
  };
}
