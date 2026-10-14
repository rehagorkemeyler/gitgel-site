// Geometry for the home page scroll story: where the bus is on the route for a
// given scroll position. Pure functions so they can be unit tested.

export type LonLat = [number, number];

const R = 6371000;
const rad = (d: number) => (d * Math.PI) / 180;

function segmentMeters(a: LonLat, b: LonLat): number {
  const dLat = rad(b[1] - a[1]);
  const dLon = rad(b[0] - a[0]) * Math.cos(rad((a[1] + b[1]) / 2));
  return Math.sqrt(dLat * dLat + dLon * dLon) * R;
}

export type Path = { points: LonLat[]; cumulative: number[]; length: number };

export function buildPath(points: LonLat[]): Path {
  const cumulative = [0];
  for (let i = 1; i < points.length; i++) {
    cumulative.push(cumulative[i - 1] + segmentMeters(points[i - 1], points[i]));
  }
  return { points, cumulative, length: cumulative[cumulative.length - 1] ?? 0 };
}

// Index of the segment that contains distance `m` (binary search).
function segmentIndex(path: Path, m: number): number {
  let lo = 0;
  let hi = path.points.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (path.cumulative[mid] <= m) lo = mid;
    else hi = mid;
  }
  return lo;
}

export function pointAt(path: Path, meters: number): LonLat {
  const m = Math.min(Math.max(meters, 0), path.length);
  const i = segmentIndex(path, m);
  const a = path.points[i];
  const b = path.points[i + 1] ?? a;
  const span = path.cumulative[i + 1] - path.cumulative[i] || 1;
  const t = (m - path.cumulative[i]) / span;
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

// The route from its start up to `meters`, for the "travelled" line.
export function sliceTo(path: Path, meters: number): LonLat[] {
  const m = Math.min(Math.max(meters, 0), path.length);
  const i = segmentIndex(path, m);
  return [...path.points.slice(0, i + 1), pointAt(path, m)];
}

// Compass bearing (0 = north, clockwise) from a to b.
export function bearing(a: LonLat, b: LonLat): number {
  const y = Math.sin(rad(b[0] - a[0])) * Math.cos(rad(b[1]));
  const x =
    Math.cos(rad(a[1])) * Math.sin(rad(b[1])) -
    Math.sin(rad(a[1])) * Math.cos(rad(b[1])) * Math.cos(rad(b[0] - a[0]));
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

// Direction of travel around `meters`, looking a little behind and ahead so
// the camera does not jerk at every street corner.
export function headingAt(path: Path, meters: number, behind = 80, ahead = 220): number {
  return bearing(pointAt(path, meters - behind), pointAt(path, meters + ahead));
}

// Shortest signed turn from angle a to angle b, in degrees (-180..180].
export function angleDelta(a: number, b: number): number {
  const d = (((b - a) % 360) + 540) % 360 - 180;
  return d === -180 ? 180 : d;
}

export const clamp01 = (x: number) => Math.min(Math.max(x, 0), 1);
export const smootherstep = (x: number) => {
  const t = clamp01(x);
  return t * t * t * (t * (t * 6 - 15) + 10);
};

// Scroll progress (0..1) over `anchors.length` equal steps -> metres along the
// route. Each step holds the bus at its anchor for a while (`hold` of the
// step), then drives smoothly to the next one.
export function metersForProgress(progress: number, anchors: number[], hold = 0.35): number {
  if (anchors.length === 0) return 0;
  if (anchors.length === 1) return anchors[0];
  const s = clamp01(progress) * (anchors.length - 1);
  const i = Math.min(Math.floor(s), anchors.length - 2);
  const u = s - i;
  const half = hold / 2;
  const t = smootherstep((u - half) / (1 - hold));
  return anchors[i] + (anchors[i + 1] - anchors[i]) * t;
}
