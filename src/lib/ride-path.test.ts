import { describe, expect, it } from "vitest";
import {
  angleDelta,
  bearing,
  buildPath,
  headingAt,
  metersForProgress,
  pointAt,
  sliceTo,
  type LonLat,
} from "./ride-path";

// Three points roughly 111 m apart going north, then east.
const pts: LonLat[] = [
  [32.85, 39.92],
  [32.85, 39.921],
  [32.8513, 39.921],
];
const path = buildPath(pts);

describe("buildPath / pointAt", () => {
  it("measures segment lengths in metres", () => {
    expect(path.cumulative[1]).toBeCloseTo(111.2, 0);
    expect(path.length).toBeGreaterThan(path.cumulative[1]);
  });
  it("interpolates and clamps", () => {
    expect(pointAt(path, 0)).toEqual(pts[0]);
    expect(pointAt(path, -50)).toEqual(pts[0]);
    expect(pointAt(path, 1e9)).toEqual(pts[2]);
    const mid = pointAt(path, path.cumulative[1] / 2);
    expect(mid[1]).toBeCloseTo(39.9205, 6);
  });
  it("slices the travelled part", () => {
    const s = sliceTo(path, path.cumulative[1] + 10);
    expect(s).toHaveLength(3);
    expect(s[1]).toEqual(pts[1]);
  });
});

describe("bearings", () => {
  it("points north and east", () => {
    expect(bearing(pts[0], pts[1])).toBeCloseTo(0, 3);
    expect(bearing(pts[1], pts[2])).toBeCloseTo(90, 0);
  });
  it("heads between the two directions at the corner", () => {
    const h = headingAt(path, path.cumulative[1], 50, 50);
    expect(h).toBeGreaterThan(10);
    expect(h).toBeLessThan(80);
  });
  it("takes the short way round", () => {
    expect(angleDelta(350, 10)).toBe(20);
    expect(angleDelta(10, 350)).toBe(-20);
    expect(angleDelta(0, 180)).toBe(180);
  });
});

describe("metersForProgress", () => {
  const anchors = [0, 1000, 3000];
  it("starts and ends on the first and last anchor", () => {
    expect(metersForProgress(0, anchors)).toBe(0);
    expect(metersForProgress(1, anchors)).toBe(3000);
  });
  it("holds at an anchor, then drives", () => {
    expect(metersForProgress(0.05, anchors)).toBe(0);
    expect(metersForProgress(0.25, anchors)).toBeCloseTo(500, 5);
    expect(metersForProgress(0.5, anchors)).toBe(1000);
    expect(metersForProgress(0.75, anchors)).toBeCloseTo(2000, 5);
  });
  it("never goes backwards", () => {
    let last = -1;
    for (let p = 0; p <= 1; p += 0.01) {
      const m = metersForProgress(p, anchors);
      expect(m).toBeGreaterThanOrEqual(last);
      last = m;
    }
  });
});
