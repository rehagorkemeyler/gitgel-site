import type { LineDetail, Stop } from "./data";

export type LineStopRow = { stop: Stop; minutes: number };
export type LineDirectionView = {
  headsign: string;
  rows: LineStopRow[];
  durationMinutes: number;
  times: { weekday?: [string, string]; saturday?: [string, string]; sunday?: [string, string] };
};
export type LineView = {
  line: LineDetail;
  directions: LineDirectionView[];
  uniqueStops: Stop[];
};

export function buildLineView(line: LineDetail, stopsById: Map<string, Stop>): LineView {
  const directions = line.directions.map((d) => {
    const rows: LineStopRow[] = [];
    d.stops.forEach((id, i) => {
      const stop = stopsById.get(id);
      if (stop) rows.push({ stop, minutes: d.offsets[i] ?? 0 });
    });
    return {
      headsign: d.headsign,
      rows,
      durationMinutes: d.offsets.length ? Math.max(...d.offsets) : 0,
      times: d.first_last,
    };
  });
  const seen = new Set<string>();
  const uniqueStops: Stop[] = [];
  for (const d of directions) {
    for (const r of d.rows) {
      if (!seen.has(r.stop.id)) {
        seen.add(r.stop.id);
        uniqueStops.push(r.stop);
      }
    }
  }
  return { line, directions: directions.filter((d) => d.rows.length > 0), uniqueStops };
}
