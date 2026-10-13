import type { LineDetail, LineMeta, Stop } from "./data";

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

/**
 * Lines for a guide that lists none: those serving the most of its stops,
 * rail-like modes first so a metro or tram is not buried under buses.
 */
export function pickDerivedLines(stops: Stop[], meta: Map<string, LineMeta>, max: number): string[] {
  const score = new Map<string, number>();
  for (const stop of stops) {
    for (const id of stop.lines) score.set(id, (score.get(id) ?? 0) + 1);
  }
  const bonus = (id: string) => (meta.get(id)?.mode === "bus" ? 0 : 100);
  return [...score.keys()]
    .filter((id) => meta.has(id))
    .sort((a, b) => score.get(b)! + bonus(b) - (score.get(a)! + bonus(a)) || a.localeCompare(b, "tr", { numeric: true }))
    .slice(0, max);
}

type GuideLike = { slug: string; city: string; lines: string[]; stops: string[] };

/** Other guides of the same city, ranked by shared lines and stops, then by slug. */
export function relatedGuides<T extends GuideLike>(all: T[], guide: T, count: number): T[] {
  const overlap = (g: T) =>
    g.lines.filter((l) => guide.lines.includes(l)).length + g.stops.filter((s) => guide.stops.includes(s)).length;
  return all
    .filter((g) => g.city === guide.city && g.slug !== guide.slug)
    .sort((a, b) => overlap(b) - overlap(a) || a.slug.localeCompare(b.slug))
    .slice(0, count);
}
