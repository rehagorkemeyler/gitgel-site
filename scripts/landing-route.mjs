// Regenerates src/content/landing-route.json, the snapshot behind the home page
// scroll story (Ankara line 413, Altınpark -> Atakule). Run: node scripts/landing-route.mjs
// Stops and times come from the PWA data; the road geometry from the public OSRM demo server.
import { writeFileSync } from "node:fs";

const BASE = "https://rehagorkemeyler.github.io/GitGel/data/ankara";
const LINE = "413";
const LAST_STOP_INDEX = 24; // Atakule

const get = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} for ${url}`);
  return res.json();
};

const line = await get(`${BASE}/lines/${LINE}.json`);
const stops = new Map((await get(`${BASE}/stops.json`)).map((s) => [s.id, s]));
const dir = line.directions[0];
const ids = dir.stops.slice(0, LAST_STOP_INDEX + 1);
const picked = ids.map((id, i) => {
  const s = stops.get(id);
  if (!s) throw new Error(`Missing stop ${id}`);
  return { id, name: s.name, lat: s.lat, lon: s.lon, minute: dir.offsets[i] ?? i };
});

// Route each stop-to-stop leg on its own. OSRM sometimes loops round a block
// when a stop sits on the far side of a one-way street; for such legs (much
// longer than the straight line) a straight segment looks truer on the map.
const R = 6371000;
const rad = (d) => (d * Math.PI) / 180;
const straight = (a, b) =>
  Math.hypot(rad(b.lon - a.lon) * Math.cos(rad((a.lat + b.lat) / 2)), rad(b.lat - a.lat)) * R;
const path = [];
const withDistance = [];
let along = 0;
for (let i = 0; i < picked.length; i++) {
  const a = picked[i];
  withDistance.push({ ...a, meters: Math.round(along) });
  const b = picked[i + 1];
  if (!b) break;
  const leg = await get(
    `https://router.project-osrm.org/route/v1/driving/${a.lon},${a.lat};${b.lon},${b.lat}?overview=full&geometries=geojson`,
  );
  const r = leg.routes[0];
  const direct = straight(a, b);
  const useRoad = r && r.distance < direct * 1.5;
  const coords = useRoad ? r.geometry.coordinates : [[a.lon, a.lat], [b.lon, b.lat]];
  path.push(...(path.length ? coords.slice(1) : coords));
  along += useRoad ? r.distance : direct;
  if (!useRoad) console.log(`Straight leg: ${a.name} -> ${b.name}`);
}

const round = (n) => Math.round(n * 1e5) / 1e5;
const out = {
  line: LINE,
  longName: line.long_name,
  firstLast: dir.first_last,
  meters: Math.round(along),
  stops: withDistance.map((s) => ({ ...s, lat: round(s.lat), lon: round(s.lon) })),
  path: path.map(([x, y]) => [round(x), round(y)]),
};
writeFileSync(new URL("../src/content/landing-route.json", import.meta.url), JSON.stringify(out) + "\n");
console.log(`Wrote ${out.stops.length} stops, ${out.path.length} points, ${out.meters} m`);
