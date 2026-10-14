import type { RideStop } from "./landing";

export type OverlayState = {
  /** Index of the last stop the bus has reached. */
  passed: number;
  /** Stop the bus is waiting at, or -1 while it drives between stops. */
  at: number;
  /** Next stop ahead, or -1 at the terminus. */
  next: number;
  minutesLeft: number;
};

// What the trip chip and the stop rail show for a bus `meters` along the route.
export function overlayState(stops: RideStop[], meters: number): OverlayState {
  const next = stops.findIndex((s) => s.meters > meters + 1);
  const passed = next === -1 ? stops.length - 1 : Math.max(next - 1, 0);
  const at = stops.findIndex((s) => Math.abs(s.meters - meters) < 15);
  const last = stops[stops.length - 1];
  let minute = stops[passed].minute;
  if (next > 0) {
    const a = stops[next - 1];
    const b = stops[next];
    minute = a.minute + ((b.minute - a.minute) * (meters - a.meters)) / Math.max(b.meters - a.meters, 1);
  }
  return { passed, at, next, minutesLeft: Math.max(0, Math.ceil(last.minute - minute)) };
}

/** Opacity of story card `i` when the story is at step position `s` (fractional). */
export const cardOpacity = (s: number, i: number) => Math.min(Math.max(1 - Math.abs(s - i) * 2.2, 0), 1);
