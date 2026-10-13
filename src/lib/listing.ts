import type { LineMeta, Stop } from "./data";
import { slugify } from "./slug";

/** a-z for names starting with a letter (ç->c, ş->s, ı/İ->i ...), "0-9" for everything else. */
export function letterKey(name: string): string {
  const first = slugify(name.trim()).charAt(0);
  return /[a-z]/.test(first) ? first : "0-9";
}

export const LETTER_KEYS = [..."abcdefghijklmnopqrstuvwxyz", "0-9"];

export function stopsForLetter(stops: Stop[], letter: string): Stop[] {
  return stops
    .filter((s) => letterKey(s.name) === letter)
    .sort((a, b) => a.name.localeCompare(b.name, "tr") || a.id.localeCompare(b.id));
}

export function searchStops(stops: Stop[], query: string, limit = 50): Stop[] {
  const q = slugify(query);
  if (q.length < 2) return [];
  return stops.filter((s) => slugify(s.name).includes(q)).slice(0, limit);
}

const MODE_ORDER = ["metro", "rail", "tram", "metrobus", "funicular", "cablecar", "ferry", "bus"];

export function groupLinesByMode(lines: LineMeta[]): { mode: string; lines: LineMeta[] }[] {
  const byMode = new Map<string, LineMeta[]>();
  for (const l of lines) byMode.set(l.mode, [...(byMode.get(l.mode) ?? []), l]);
  return [...byMode.entries()]
    .sort(([a], [b]) => MODE_ORDER.indexOf(a) - MODE_ORDER.indexOf(b))
    .map(([mode, list]) => ({
      mode,
      lines: list.sort((a, b) => a.name.localeCompare(b.name, "tr", { numeric: true })),
    }));
}
