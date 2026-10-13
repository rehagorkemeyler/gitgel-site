import type { LineDetail } from "./data";

const toMinutes = (t: string): number | null => {
  const m = /^(\d{1,2}):(\d{2})$/.exec(t);
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
};

// Times before 04:00 belong to the previous service day ("00:35" is later than "23:50").
const serviceMinutes = (t: string): number | null => {
  const m = toMinutes(t);
  return m === null ? null : m < 240 ? m + 1440 : m;
};

export type GuideStats = {
  lineCount: number;
  earliestFirst: string | null;
  latestLast: string | null;
  overnightLines: number;
};

/** Weekday first/last departures across every direction of the given lines. */
export function summarizeLines(lines: LineDetail[]): GuideStats {
  let earliest: [number, string] | null = null;
  let latest: [number, string] | null = null;
  let overnight = 0;
  for (const line of lines) {
    let isOvernight = false;
    for (const d of line.directions) {
      const wk = d.first_last.weekday;
      if (!wk) continue;
      const first = serviceMinutes(wk[0]);
      const last = serviceMinutes(wk[1]);
      if (first !== null && (!earliest || first < earliest[0])) earliest = [first, wk[0]];
      if (last !== null && (!latest || last > latest[0])) latest = [last, wk[1]];
      if (wk[1] === "night") isOvernight = true;
    }
    if (isOvernight) overnight++;
  }
  return {
    lineCount: lines.length,
    earliestFirst: earliest?.[1] ?? null,
    latestLast: latest?.[1] ?? null,
    overnightLines: overnight,
  };
}
