import { cache } from "react";
import type { City } from "./config";

const BASE = "https://rehagorkemeyler.github.io/GitGel/data";
const REVALIDATE_SECONDS = 86400;

export type Stop = { id: string; name: string; lat: number; lon: number; mode: string; lines: string[] };
export type LineMeta = { id: string; name: string; long_name: string; mode: string };
export type Direction = {
  headsign: string;
  stops: string[];
  offsets: number[];
  first_last: Record<string, [string, string]>;
};
export type LineDetail = LineMeta & { directions: Direction[] };

const cityBase = (city: City) => (city === "istanbul" ? BASE : `${BASE}/${city}`);

// Warm instances keep the last good copy in memory. The big Istanbul stops file
// is over Next's 2 MB data-cache limit, so this layer is what stops every page
// render from refetching it, and it serves stale data if the source is down.
const memory = new Map<string, { at: number; data: unknown }>();

// A failed fetch with nothing cached throws on purpose: during ISR regeneration
// Next then keeps serving the last good page instead of replacing it with an error.
async function getJson<T>(url: string): Promise<T> {
  const hit = memory.get(url);
  if (hit && Date.now() - hit.at < REVALIDATE_SECONDS * 1000) return hit.data as T;
  try {
    const res = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } });
    if (!res.ok) throw new Error(`Data source returned ${res.status} for ${url}`);
    const data = (await res.json()) as T;
    memory.set(url, { at: Date.now(), data });
    return data;
  } catch (err) {
    if (hit) return hit.data as T;
    throw err;
  }
}

export const getStops = cache((city: City) => getJson<Stop[]>(`${cityBase(city)}/stops.json`));

export const getLines = cache(async (city: City) => {
  const lines = await getJson<LineMeta[]>(`${cityBase(city)}/lines.json`);
  return new Map(lines.map((l) => [l.id, l]));
});

export const getLineDetail = cache((city: City, id: string) =>
  getJson<LineDetail>(`${cityBase(city)}/lines/${encodeURIComponent(id)}.json`),
);
