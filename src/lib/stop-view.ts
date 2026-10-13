import { distanceMeters } from "./geo";
import type { Direction, LineDetail, LineMeta, Stop } from "./data";

export type StopDeparture = { headsign: string; first: string; last: string };
export type StopLine = { id: string; name: string; longName: string; mode: string; departures: StopDeparture[] };
export type Neighbor = { stop: Stop; meters: number; lineNames: string[] };
export type StopView = { stop: Stop; lines: StopLine[]; opposite: Neighbor | null; nearby: Neighbor[] };

const OPPOSITE_MAX_M = 150;
const NEARBY_MAX_M = 600;
const NEARBY_COUNT = 6;

/** "05:30" + 12 min -> "05:42"; non-clock values ("night") pass through. */
export function addMinutes(time: string, minutes: number): string {
  const m = /^(\d{1,2}):(\d{2})$/.exec(time);
  if (!m) return time;
  const total = (Number(m[1]) * 60 + Number(m[2]) + minutes) % 1440;
  const h = String(Math.floor(total / 60)).padStart(2, "0");
  return `${h}:${String(total % 60).padStart(2, "0")}`;
}

export function departuresAt(stopId: string, directions: Direction[]): StopDeparture[] {
  const out: StopDeparture[] = [];
  for (const d of directions) {
    const i = d.stops.indexOf(stopId);
    const weekday = d.first_last.weekday;
    if (i === -1 || !weekday) continue;
    const offset = d.offsets[i] ?? 0;
    out.push({ headsign: d.headsign, first: addMinutes(weekday[0], offset), last: addMinutes(weekday[1], offset) });
  }
  return out;
}

export function roundMeters(m: number): number {
  return m < 100 ? Math.max(10, Math.round(m / 10) * 10) : Math.round(m / 10) * 10;
}

export function buildStopView(
  stop: Stop,
  allStops: Stop[],
  lineMeta: Map<string, LineMeta>,
  details: Map<string, LineDetail>,
): StopView {
  const lines: StopLine[] = stop.lines.flatMap((id) => {
    const meta = lineMeta.get(id);
    if (!meta) return [];
    const detail = details.get(id);
    return [{
      id,
      name: meta.name,
      longName: meta.long_name,
      mode: meta.mode,
      departures: detail ? departuresAt(stop.id, detail.directions) : [],
    }];
  });

  const mine = new Set(stop.lines);
  const near: Neighbor[] = [];
  for (const other of allStops) {
    if (other.id === stop.id) continue;
    if (Math.abs(other.lat - stop.lat) > 0.01 || Math.abs(other.lon - stop.lon) > 0.015) continue;
    const meters = distanceMeters(stop.lat, stop.lon, other.lat, other.lon);
    if (meters > NEARBY_MAX_M) continue;
    near.push({
      stop: other,
      meters,
      lineNames: other.lines.map((l) => lineMeta.get(l)?.name ?? l),
    });
  }
  near.sort((a, b) => a.meters - b.meters);

  const opposite =
    near.find((n) => n.meters <= OPPOSITE_MAX_M && n.stop.lines.some((l) => mine.has(l))) ?? null;
  const nearby = near.filter((n) => n !== opposite).slice(0, NEARBY_COUNT);
  return { stop, lines, opposite, nearby };
}
