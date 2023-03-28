import { computeDestinationPoint } from "geolib";

export const getBoundingCoordinatesFromCenter = (
  center: [number, number], // [lat, lon]
  distance: number, // distance in meters
  offset?: [number, number] // center offset in meters
) => {
  const bearings = {
    north: 0,
    east: 90,
    south: 180,
    west: 270,
  };
  const EARTH_RADIUS_IN_METERS = 6371e3;
  // Convert the offset in meters to degrees
  const offsetInDegrees = offset
    ? [
        offset[1] / ((EARTH_RADIUS_IN_METERS * Math.PI) / 180),
        offset[0] /
          (((EARTH_RADIUS_IN_METERS * Math.PI) / 180) *
            Math.cos((center[1] * Math.PI) / 180)),
      ]
    : [0, 0];

  // Compute the center point adjusted by the offset
  const _center: [number, number] = [
    center[0] + offsetInDegrees[1],
    center[1] + offsetInDegrees[0],
  ];

  const maxLatitude = computeDestinationPoint(
    _center,
    distance,
    bearings.north,
    EARTH_RADIUS_IN_METERS
  ).latitude.toFixed(9);
  const minLatitude = computeDestinationPoint(
    _center,
    distance,
    bearings.south,
    EARTH_RADIUS_IN_METERS
  ).latitude.toFixed(9);
  const maxLongitude = computeDestinationPoint(
    _center,
    distance,
    bearings.east,
    EARTH_RADIUS_IN_METERS
  ).longitude.toFixed(9);
  const minLongitude = computeDestinationPoint(
    _center,
    distance,
    bearings.west,
    EARTH_RADIUS_IN_METERS
  ).longitude.toFixed(9);

  return {
    maxLatitude,
    minLatitude,
    maxLongitude,
    minLongitude,
  };
};

export const getGridCoordinates = (
  totalSize: number,
  cellSize: number
): [number, number, number][] => {
  const count = Math.floor(totalSize / cellSize);
  const startX = -(totalSize / 2) + cellSize / 2;
  const startY = -(totalSize / 2) + cellSize / 2;
  const coordinates: [number, number, number][] = [];

  for (let i = 0; i < count; i++) {
    for (let j = 0; j < count; j++) {
      const x = startX + j * cellSize;
      const y = startY + i * cellSize;
      coordinates.push([x, y, 0]);
    }
  }
  return coordinates;
};
