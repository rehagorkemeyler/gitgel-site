import { describe, expect, it } from "vitest";
import type { RideStop } from "./landing";
import { cardOpacity, overlayState } from "./ride-overlay";

const stop = (i: number, meters: number): RideStop => ({ id: `s${i}`, name: `S${i}`, lat: 0, lon: 0, minute: i * 2, meters });
const stops = [stop(0, 0), stop(1, 500), stop(2, 1000)];

describe("overlayState", () => {
  it("waits at the first stop", () => {
    expect(overlayState(stops, 0)).toEqual({ passed: 0, at: 0, next: 1, minutesLeft: 4 });
  });
  it("drives between stops", () => {
    expect(overlayState(stops, 750)).toEqual({ passed: 1, at: -1, next: 2, minutesLeft: 1 });
  });
  it("arrives at the terminus", () => {
    expect(overlayState(stops, 1000)).toEqual({ passed: 2, at: 2, next: -1, minutesLeft: 0 });
  });
});

describe("cardOpacity", () => {
  it("shows a card fully only at rest on its step", () => {
    expect(cardOpacity(2, 2)).toBe(1);
    expect(cardOpacity(2.5, 2)).toBe(0);
    expect(cardOpacity(1.9, 2)).toBeCloseTo(0.78, 2);
  });
});
