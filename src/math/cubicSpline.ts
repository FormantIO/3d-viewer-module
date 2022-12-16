interface Point {
  latitude: number;
  longitude: number;
}

export class CubicSpline {
  points: Point[];

  constructor(points: Point[]) {
    this.points = points;
  }

  at(t: number): Point {
    // determine which segment of the spline to use
    const segment = Math.floor(t * (this.points.length - 1));
    // calculate the exact position on the segment
    const localT = t * (this.points.length - 1) - segment;
    // use a cubic interpolation to calculate the coordinates
    // at the specified position on the spline
    return this.interpolate(
      this.points[segment],
      this.points[segment + 1],
      this.points[segment + 2],
      this.points[segment + 3],
      localT
    );
  }

  interpolate(p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point {
    // calculate the coordinates using a cubic interpolation
    const x = this.interpolate1d(
      p0.latitude,
      p1.latitude,
      p2.latitude,
      p3.latitude,
      t
    );
    const y = this.interpolate1d(
      p0.longitude,
      p1.longitude,
      p2.longitude,
      p3.longitude,
      t
    );
    return { latitude: x, longitude: y };
  }

  interpolate1d(
    p0: number,
    p1: number,
    p2: number,
    p3: number,
    t: number
  ): number {
    // calculate the coordinates using a cubic interpolation
    return (
      (1 - t) ** 3 * p0 +
      3 * (1 - t) ** 2 * t * p1 +
      3 * (1 - t) * t ** 2 * p2 +
      t ** 3 * p3
    );
  }
}
