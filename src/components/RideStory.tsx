"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Map as MlMap, Marker, GeoJSONSource } from "maplibre-gl";
import type { LandingText, RideDemo, RideRoute } from "@/lib/landing";
import {
  angleDelta,
  buildPath,
  clamp01,
  headingAt,
  metersForProgress,
  pointAt,
  sliceTo,
  smootherstep,
} from "@/lib/ride-path";

type Props = {
  route: RideRoute;
  text: LandingText;
  appWebUrl: string;
  androidUrl: string;
  useWeb: string;
  androidDownload: string;
};

type Camera = { lon: number; lat: number; zoom: number; pitch: number; bearing: number };
type Pad = { top: number; bottom: number; left: number };

const STYLE_URL = "https://tiles.openfreemap.org/styles/dark";
const DEM_TILES = "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png";
const GOLD = "#ffb43a";

// Camera for the opening overview: the whole of central Ankara, tilted, at dusk.
const OVERVIEW = { zoom: 12.2, pitch: 76, bearing: 205 };

export default function RideStory({ route, text, appWebUrl, androidUrl, useWeb, androidDownload }: Props) {
  const rootRef = useRef<HTMLElement>(null);
  const mapEl = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const [progress, setProgress] = useState(0);
  const [mapReady, setMapReady] = useState(false);

  const path = useMemo(() => buildPath(route.path), [route.path]);
  const anchors = useMemo(() => text.steps.map((s) => route.stops[s.stop].meters), [text.steps, route.stops]);
  const stepCount = text.steps.length;
  const lastStop = route.stops[route.stops.length - 1];

  // Scroll -> progress (0..1) over the whole story.
  useEffect(() => {
    const onScroll = () => {
      const el = rootRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      const p = total > 0 ? clamp01(-r.top / total) : 0;
      progressRef.current = p;
      setProgress(p);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // The map: loaded lazily so the text paints first, and skipped entirely if WebGL is missing.
  useEffect(() => {
    let disposed = false;
    let map: MlMap | undefined;
    let raf = 0;
    const markers: Marker[] = [];

    (async () => {
      const maplibre = (await import("maplibre-gl")).default;
      if (disposed || !mapEl.current) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const narrow = window.innerWidth < 760;
      const start = pointAt(path, 0);
      const overview = pointAt(path, anchors[2] ?? 0);
      try {
        map = new maplibre.Map({
          container: mapEl.current,
          style: STYLE_URL,
          center: overview,
          zoom: OVERVIEW.zoom,
          pitch: OVERVIEW.pitch,
          bearing: OVERVIEW.bearing,
          interactive: false,
          attributionControl: { compact: true },
          maxPitch: 80,
          fadeDuration: 0,
        });
      } catch {
        return; // No WebGL: the dusk gradient behind stays as the backdrop.
      }
      const m = map;

      m.on("load", () => {
        if (disposed) return;
        m.addSource("dem", { type: "raster-dem", tiles: [DEM_TILES], encoding: "terrarium", tileSize: 256, maxzoom: 14 });
        m.addSource("dem-shade", { type: "raster-dem", tiles: [DEM_TILES], encoding: "terrarium", tileSize: 256, maxzoom: 14 });
        m.setTerrain({ source: "dem", exaggeration: 1.6 });
        m.setSky({
          "sky-color": "#0a1630",
          "horizon-color": "#f59e5b",
          "fog-color": "#18213a",
          "sky-horizon-blend": 0.55,
          "horizon-fog-blend": 0.75,
          "fog-ground-blend": 0.35,
          "atmosphere-blend": 0.6,
        });

        const firstSymbol = m.getStyle().layers.find((l) => l.type === "symbol")?.id;
        m.addLayer(
          {
            id: "gg-hillshade",
            type: "hillshade",
            source: "dem-shade",
            paint: {
              "hillshade-shadow-color": "#05080f",
              "hillshade-highlight-color": "#f4a261",
              "hillshade-accent-color": "#0c1222",
              "hillshade-exaggeration": 0.55,
              "hillshade-illumination-direction": 290,
            },
          },
          firstSymbol,
        );

        const hasBuildings = m.getStyle().layers.some((l) => l.type === "fill-extrusion");
        if (!hasBuildings && m.getSource("openmaptiles")) {
          m.addLayer(
            {
              id: "gg-buildings",
              type: "fill-extrusion",
              source: "openmaptiles",
              "source-layer": "building",
              minzoom: 13,
              paint: {
                "fill-extrusion-color": ["interpolate", ["linear"], ["coalesce", ["get", "render_height"], 6], 0, "#1a2236", 40, "#2b3550"],
                "fill-extrusion-height": ["coalesce", ["get", "render_height"], 6],
                "fill-extrusion-base": ["coalesce", ["get", "render_min_height"], 0],
                "fill-extrusion-opacity": ["interpolate", ["linear"], ["zoom"], 13, 0, 14.5, 0.85],
              },
            },
            firstSymbol,
          );
        }

        const line = (coords: [number, number][]) => ({
          type: "Feature" as const,
          properties: {},
          geometry: { type: "LineString" as const, coordinates: coords },
        });
        m.addSource("route", { type: "geojson", data: line(route.path) });
        m.addSource("route-done", { type: "geojson", data: line([route.path[0], route.path[0]]) });
        m.addSource("stops", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: route.stops.map((s, i) => ({
              type: "Feature",
              id: i,
              properties: { m: s.meters },
              geometry: { type: "Point", coordinates: [s.lon, s.lat] },
            })),
          },
        });
        m.addLayer({ id: "gg-route", type: "line", source: "route", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": GOLD, "line-width": 3, "line-opacity": 0.28 } });
        m.addLayer({ id: "gg-route-glow", type: "line", source: "route-done", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": GOLD, "line-width": 16, "line-opacity": 0.35, "line-blur": 10 } });
        m.addLayer({ id: "gg-route-done", type: "line", source: "route-done", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": GOLD, "line-width": 4.5 } });
        m.addLayer({
          id: "gg-stops",
          type: "circle",
          source: "stops",
          paint: {
            "circle-radius": ["interpolate", ["linear"], ["zoom"], 11, 2.2, 16, 5.5],
            "circle-color": ["case", ["boolean", ["feature-state", "passed"], false], GOLD, "#0d1424"],
            "circle-stroke-color": GOLD,
            "circle-stroke-width": 1.6,
            "circle-pitch-alignment": "map",
          },
        });

        // Labels for the stops the story talks about, and the bus itself.
        for (const i of new Set(text.steps.map((s) => s.stop))) {
          const s = route.stops[i];
          const el = document.createElement("div");
          el.className = "rs-label";
          el.textContent = s.name;
          markers.push(new maplibre.Marker({ element: el, anchor: "top", offset: [0, 10] }).setLngLat([s.lon, s.lat]).addTo(m));
        }
        const bus = document.createElement("div");
        bus.className = "rs-bus";
        bus.innerHTML = `<span class="rs-bus-pulse"></span><span class="rs-bus-dot"></span><span class="rs-bus-tag">${route.line}</span>`;
        const busMarker = new maplibre.Marker({ element: bus, anchor: "center" }).setLngLat(start).addTo(m);
        markers.push(busMarker);

        // The overview looks south-west over the city from above Ulus, towards the Çankaya hills.
        const overviewCenter = pointAt(path, anchors[2] ?? 0);
        const cam: Camera & { pad: Pad } = { lon: overviewCenter[0], lat: overviewCenter[1], ...OVERVIEW, pad: { top: 0, bottom: 0, left: 0 } };
        let lastDone = -1;
        let passed = -1;

        const target = (p: number) => {
          const meters = metersForProgress(p, anchors, 0.4);
          const bus = pointAt(path, meters);
          const s = p * (stepCount - 1);
          // Step 0 -> 1 drops from the overview into the ride camera; the
          // last step swings round and settles lower for the arrival.
          const lift = smootherstep(s / 0.85);
          const arrive = smootherstep(s - (stepCount - 2) - 0.3);
          const ride = { zoom: narrow ? 15.2 : 15.6, pitch: narrow ? 60 : 66 };
          const zoom = OVERVIEW.zoom + (ride.zoom - OVERVIEW.zoom) * lift + 0.5 * arrive;
          const pitch = OVERVIEW.pitch + (ride.pitch - OVERVIEW.pitch) * lift - 6 * arrive;
          const heading = headingAt(path, meters) - 35 * arrive;
          const bearing = OVERVIEW.bearing + angleDelta(OVERVIEW.bearing, heading) * lift;
          const h = m.getContainer().clientHeight;
          const w = m.getContainer().clientWidth;
          // Keep the bus clear of the text: lower-middle on wide screens, upper half on phones
          // (cards sit at the bottom there), and beside the arrival card at the end.
          const ridePad: Pad = narrow ? { top: 0, bottom: h * 0.42, left: 0 } : { top: h * 0.22, bottom: 0, left: w * 0.12 };
          const endPad: Pad = narrow ? { top: 0, bottom: h * 0.5, left: 0 } : { top: h * 0.1, bottom: 0, left: w * 0.42 };
          const heroPad: Pad = narrow ? { top: 0, bottom: h * 0.55, left: 0 } : { top: 0, bottom: 0, left: w * 0.4 };
          const mix = (x: Pad, y: Pad, t: number): Pad => ({
            top: x.top + (y.top - x.top) * t,
            bottom: x.bottom + (y.bottom - x.bottom) * t,
            left: x.left + (y.left - x.left) * t,
          });
          const pad = mix(mix(heroPad, ridePad, lift), endPad, arrive);
          const lon = overviewCenter[0] + (bus[0] - overviewCenter[0]) * lift;
          const lat = overviewCenter[1] + (bus[1] - overviewCenter[1]) * lift;
          return { lon, lat, zoom, pitch, bearing, pad, meters, bus };
        };

        let elevation = 0;
        const frame = () => {
          raf = 0;
          const t = target(progressRef.current);
          const k = reduced ? 1 : 0.11;
          cam.lon += (t.lon - cam.lon) * k;
          cam.lat += (t.lat - cam.lat) * k;
          cam.zoom += (t.zoom - cam.zoom) * k;
          cam.pitch += (t.pitch - cam.pitch) * k;
          cam.bearing += angleDelta(cam.bearing, t.bearing) * k * 0.8;
          cam.pad = {
            top: cam.pad.top + (t.pad.top - cam.pad.top) * k,
            bottom: cam.pad.bottom + (t.pad.bottom - cam.pad.bottom) * k,
            left: cam.pad.left + (t.pad.left - cam.pad.left) * k,
          };
          // Ankara sits ~900 m up: aim at the ground, not at sea level under it.
          const ground = m.queryTerrainElevation([cam.lon, cam.lat]);
          const groundGap = ground === null ? 0 : ground - elevation;
          if (ground !== null) elevation += groundGap * (elevation === 0 ? 1 : 0.2);
          m.jumpTo({
            center: [cam.lon, cam.lat],
            zoom: cam.zoom,
            pitch: cam.pitch,
            bearing: cam.bearing,
            elevation,
            padding: { ...cam.pad, right: 0 },
          });
          busMarker.setLngLat(t.bus);

          if (Math.abs(t.meters - lastDone) > 0.5) {
            lastDone = t.meters;
            (m.getSource("route-done") as GeoJSONSource).setData(line(sliceTo(path, t.meters)));
            const nowPassed = route.stops.filter((s) => s.meters <= t.meters + 1).length - 1;
            if (nowPassed !== passed) {
              route.stops.forEach((_, i) => m.setFeatureState({ source: "stops", id: i }, { passed: i <= nowPassed }));
              passed = nowPassed;
            }
          }
          const settled =
            Math.abs(t.lon - cam.lon) < 1e-7 &&
            Math.abs(groundGap) < 1 &&
            Math.abs(t.pad.left - cam.pad.left) < 0.5 &&
            Math.abs(t.pad.bottom - cam.pad.bottom) < 0.5 &&
            Math.abs(t.lat - cam.lat) < 1e-7 &&
            Math.abs(t.zoom - cam.zoom) < 1e-3 &&
            Math.abs(angleDelta(cam.bearing, t.bearing)) < 0.05;
          if (!settled) raf = requestAnimationFrame(frame);
        };
        const kick = () => {
          if (!raf) raf = requestAnimationFrame(frame);
        };
        window.addEventListener("scroll", kick, { passive: true });
        window.addEventListener("resize", kick);
        // Terrain tiles arrive after the first frames; re-aim once they do.
        m.on("sourcedata", (e) => e.sourceId === "dem" && kick());
        m.once("remove", () => {
          window.removeEventListener("scroll", kick);
          window.removeEventListener("resize", kick);
        });
        // Snap straight to where the visitor already is (e.g. a reload mid-page).
        const t0 = target(progressRef.current);
        Object.assign(cam, { lon: t0.lon, lat: t0.lat, zoom: t0.zoom, pitch: t0.pitch, bearing: t0.bearing, pad: t0.pad });
        kick();
        // Fade the map in once tiles are drawn, or after a short wait on slow connections.
        const reveal = () => !disposed && setMapReady(true);
        m.once("idle", reveal);
        setTimeout(reveal, 1800);
      });
    })();

    return () => {
      disposed = true;
      if (raf) cancelAnimationFrame(raf);
      markers.forEach((mk) => mk.remove());
      map?.remove();
    };
  }, [path, anchors, stepCount, route, text.steps]);

  // Overlay state derived from the same progress the map uses.
  const s = progress * (stepCount - 1);
  const active = Math.min(Math.round(s), stepCount - 1);
  const meters = metersForProgress(progress, anchors, 0.4);
  const nextIndex = route.stops.findIndex((st) => st.meters > meters + 1);
  const passedCount = nextIndex === -1 ? route.stops.length : nextIndex;
  const nowMinute =
    nextIndex <= 0
      ? route.stops[Math.max(passedCount - 1, 0)].minute
      : (() => {
          const a = route.stops[nextIndex - 1];
          const b = route.stops[nextIndex];
          return a.minute + ((b.minute - a.minute) * (meters - a.meters)) / Math.max(b.meters - a.meters, 1);
        })();
  const left = Math.max(0, Math.ceil(lastStop.minute - nowMinute));
  // While the bus waits at a stop the chip names it; between stops it names the next one.
  const atStop = route.stops.find((st) => Math.abs(st.meters - meters) < 15);
  const chipName = atStop ? atStop.name : `→ ${nextIndex === -1 ? lastStop.name : route.stops[nextIndex].name}`;

  const scrollToStep = (i: number) => {
    const el = rootRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const total = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + (total * i) / (stepCount - 1), behavior: "smooth" });
  };
  const stepOfStop = (stopIndex: number) => {
    const found = text.steps.findIndex((st, i) => i > 0 && st.stop === stopIndex);
    return found;
  };

  return (
    <section
      ref={rootRef}
      className="rs"
      style={{ height: `${stepCount * 100}svh` }}
      data-step={active}
      data-map={mapReady ? "ready" : "loading"}
    >
      <div className="rs-stage">
        <div className="rs-sky" aria-hidden="true" />
        <div ref={mapEl} className="rs-map" aria-hidden="true" />
        <div className="rs-vignette" aria-hidden="true" />

        <div className={`rs-chip ${active > 0 ? "is-on" : ""}`} aria-hidden="true">
          <span className="rs-chip-line">{route.line}</span>
          <span className="rs-chip-text">
            <strong>{chipName}</strong>
            <small>
              {left > 0 ? text.minutesLeft.replace("{n}", String(left)) : text.arrived}
            </small>
          </span>
        </div>

        <ol className="rs-rail" aria-hidden="true">
          {text.rail.map((i) => {
            const st = route.stops[i];
            const isPassed = st.meters <= meters + 1;
            const isCurrent = i === route.stops.findLastIndex((x) => x.meters <= meters + 1);
            const target = stepOfStop(i);
            return (
              <li key={st.id} className={`${isPassed ? "is-passed" : ""} ${isCurrent ? "is-current" : ""}`}>
                <button type="button" tabIndex={-1} onClick={() => target > 0 && scrollToStep(target)} disabled={target <= 0}>
                  <span className="rs-rail-name">{st.name}</span>
                  <span className="rs-rail-dot" />
                </button>
              </li>
            );
          })}
        </ol>

        <div className="rs-progress" aria-hidden="true">
          <span style={{ transform: `scaleX(${progress})` }} />
        </div>
      </div>

      <div className="rs-steps">
        {text.steps.map((step, i) => {
          const dist = Math.abs(s - i);
          const visible = clamp01(1 - dist * 1.6);
          const style = { opacity: visible, transform: `translateY(${(s - i) * -40}px)` };
          if (step.overview) {
            return (
              <div key={i} className="rs-step rs-hero">
                <div className="rs-hero-inner" style={style}>
                  <p className="rs-kicker">{step.kicker}</p>
                  <h1 className="rs-headline">
                    {text.headline[0]}
                    <span>{text.headline[1]}</span>
                  </h1>
                  <p className="rs-pitch">{text.pitch}</p>
                  <div className="rs-ctas">
                    <a className="rs-btn rs-btn-gold" href={appWebUrl}>{useWeb}</a>
                    <a className="rs-btn rs-btn-glass" href={androidUrl}>{androidDownload}</a>
                  </div>
                  <p className="rs-hint">
                    <span className="rs-mouse" aria-hidden="true" />
                    {text.scrollHint}
                  </p>
                </div>
              </div>
            );
          }
          if (i === stepCount - 1) {
            return (
              <div key={i} className="rs-step rs-final">
                <div className="rs-card" style={style}>
                  <div className="rs-card-top">
                    <span className="rs-card-eyebrow">{text.stopLabel}</span>
                    <span className="rs-chip-line">{route.line}</span>
                  </div>
                  <p className="rs-card-stop">{step.kicker}</p>
                  <h2 className="rs-card-title">{step.title}</h2>
                  <p className="rs-card-body">{step.body}</p>
                  <div className="rs-card-ctas">
                    <a className="rs-btn rs-btn-gold" href={appWebUrl}>{useWeb}</a>
                    <a className="rs-btn rs-btn-dark" href={androidUrl}>{androidDownload}</a>
                  </div>
                </div>
              </div>
            );
          }
          return (
            <div key={i} className={`rs-step ${i % 2 ? "rs-left" : "rs-right"}`}>
              <div className="rs-copy" style={style}>
                {step.feature && <p className="rs-feature">{step.feature}</p>}
                <h2>{step.title}</h2>
                <p>{step.body}</p>
                {step.demo && <Demo demo={step.demo} line={route.line} />}
                <p className="rs-where">{step.kicker}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// Small app-like widgets inside the story cards, one per feature.
function Demo({ demo, line }: { demo: RideDemo; line: string }) {
  if (demo.kind === "live") {
    return (
      <div className="rs-demo" aria-hidden="true">
        <p className="rs-demo-title">{demo.live}</p>
        {[[line, "3"], [`${line}-7`, "11"]].map(([l, m]) => (
          <div key={l} className="rs-demo-row">
            <span className="rs-chip-line">{l}</span>
            <span className="rs-demo-grow" />
            <span className="rs-live-dot" />
            <b>{m}</b>&nbsp;<small>{demo.unit}</small>
          </div>
        ))}
      </div>
    );
  }
  if (demo.kind === "route") {
    return (
      <div className="rs-demo rs-demo-route" aria-hidden="true">
        <div><small>{demo.board}</small><b>{demo.boardStop}</b></div>
        <span className="rs-demo-ride"><span className="rs-chip-line">{line}</span>{demo.ride.replace(`${line} · `, "")}</span>
        <div><small>{demo.alight}</small><b>{demo.alightStop}</b></div>
      </div>
    );
  }
  if (demo.kind === "rail") {
    return (
      <div className="rs-demo" aria-hidden="true">
        <div className="rs-demo-row">
          <span className="rs-chip-line rs-chip-metro">A1</span>
          <span>{demo.notice}</span>
          <span className="rs-demo-grow" />
          <span className="rs-live-dot" />
          <b>{demo.train}</b>
        </div>
        <div className="rs-demo-track"><span /><span /><span /><i /></div>
      </div>
    );
  }
  return (
    <div className="rs-demo" aria-hidden="true">
      <p className="rs-demo-title rs-demo-alert">{demo.title}</p>
      <div className="rs-demo-bar"><span style={{ width: `${Math.round(demo.share * 100)}%` }} /></div>
      <p className="rs-demo-sub">{demo.left}</p>
    </div>
  );
}
