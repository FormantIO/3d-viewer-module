// import {
//   BoxGeometry,
//   BufferGeometry,
//   CatmullRomCurve3,
//   Line,
//   LineBasicMaterial,
//   LineDashedMaterial,
//   Mesh,
//   MeshBasicMaterial,
//   PlaneGeometry,
//   Texture,
//   Vector3,
// } from 'three';
// import * as uuid from 'uuid';
// import { defined, UniverseDataSource } from '@formant/universe-core';
// import { getDistance } from 'geolib';
// import { UniverseLayer } from './UniverseLayer';
// import { ILocation } from '../main';
// import { LineGeometry } from '../../three-utils/lines/LineGeometry';

// export class TrailLayer extends UniverseLayer {
//   static layerTypeId = 'trail';

//   static commonName = 'Trail';

//   static description = 'A plane showing the latest location information';

//   static usesData = true;

//   loaded: boolean = false;

//   mesh: Mesh[] = [];

//   locations: Vector3[] = [];

//   zoomLevel: number = 15;

//   init() {
//     const source: UniverseDataSource = {
//       id: uuid.v4(),
//       sourceType: 'telemetry',
//       streamName: 'location?',
//       streamType: 'location',
//     };

//     this.universeData.subscribeToLocation(
//       defined(this.getLayerContext()?.deviceId),
//       source,
//       (newLoc: ILocation | Symbol) => {
//         if (typeof newLoc === 'symbol') {
//           throw new Error('unhandled data status');
//         } else if ('latitude' in newLoc && this.parent) {
//           // this.locations.push(newLoc);
//           const currentPos = new Vector3();
//           this.updateMatrixWorld();
//           this.getWorldPosition(currentPos);
//           this.locations.push(this.worldToLocal(currentPos));
//           // if (this.locations.length === 20) {
//           this.onData();
//           console.log(this);
//           console.log(currentPos); // }
//         }
//       }
//     );
//   }

//   onData = () => {
//     this.clear();
//     // const origin = this.locations[this.locations.length - 1];
//     const { length } = this.locations;
//     const points: Vector3[] = [];
//     // for (let i = 0; i <= length - 1; i += 1) {
//     //   const h1 = {
//     //     longitude: origin.longitude,
//     //     latitude: origin.latitude,
//     //   };
//     //   const h2 = {
//     //     longitude: this.locations[i].longitude,
//     //     latitude: origin.latitude,
//     //   };
//     //   let horizontalDistance = getDistance(h1, h2, 0.000001);
//     //   const l1 = {
//     //     longitude: origin.longitude,
//     //     latitude: origin.latitude,
//     //   };
//     //   const l2 = {
//     //     longitude: origin.longitude,
//     //     latitude: this.locations[i].latitude,
//     //   };
//     //   let verticalDistance = getDistance(l1, l2, 0.000001);
//     //   if (l2.latitude < l1.latitude) {
//     //     verticalDistance *= -1;
//     //   }
//     //   if (h2.longitude < h1.longitude) {
//     //     horizontalDistance *= -1;
//     //   }

//     //   points.push(new Vector3(horizontalDistance, verticalDistance, 0));
//     // }
//     // const curve = new CatmullRomCurve3(points);
//     // const curvePoints = curve.getPoints(100);
//     const curveGeometry = new BufferGeometry().setFromPoints(this.locations);
//     const curveMaterial = new LineDashedMaterial({
//       color: 0xffffff,
//       linewidth: 10,
//     });
//     const curveLine = new Line(curveGeometry, curveMaterial);
//     this.add(curveLine);
//   };
// }
