import { Point } from "./Chart";

export function bezierPath(points: Point[]) {
  return points.reduce(
    (acc, point, i, a) =>
      i === 0
        ? `M ${point.x},${point.y}`
        : `${acc} ${bezierCommand(point, i, a)}`,
    ""
  );
}

function line(pointA: Point, pointB: Point) {
  const lengthX = pointB.x - pointA.x;
  const lengthY = pointB.y - pointA.y;

  return {
    length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
    angle: Math.atan2(lengthY, lengthX),
  };
}

function controlPoint(
  current: Point,
  previous: Point,
  next: Point,
  reverse: boolean = false,
  smoothing = 0.2
) {
  const o = line(previous, next);
  const angle = o.angle + (reverse ? Math.PI : 0);
  const length = o.length * smoothing;
  const x = current.x + Math.cos(angle) * length;
  const y = current.y + Math.sin(angle) * length;
  return [x, y];
}

function bezierCommand(point: Point, i: number, a: Point[]) {
  // start control point
  const [cpsX, cpsY] = controlPoint(
    a[Math.max(i - 1, 0)],
    a[Math.max(i - 2, 0)],
    point
  );

  // end control point
  const [cpeX, cpeY] = controlPoint(
    point,
    a[Math.max(i - 1, 0)],
    a[Math.min(i + 1, a.length - 1)],
    true
  );

  return `C ${cpsX}, ${cpsY} ${cpeX}, ${cpeY} ${point.x}, ${point.x}`;
}
