"use client";

import { useEffect, useMemo, useRef } from "react";
import type { ExpressionSpecification, Map as MlMap, Marker, StyleSpecification } from "maplibre-gl";
import type { LandingText, RideDemo, RideRoute } from "@/lib/landing";
import { angleDelta, buildPath, clamp01, headingAt, metersForProgress, pointAt, smootherstep } from "@/lib/ride-path";
import { cardOpacity, overlayState } from "@/lib/ride-overlay";

type Props = {
  route: RideRoute;
  text: LandingText;
  appWebUrl: string;
  androidUrl: string;
  useWeb: string;
  androidDownload: string;
};

type Pad = { top: number; bottom: number; left: number };
type Cam = { lon: number; lat: number; zoom: number; pitch: number; bearing: number; pad: Pad };

const STYLE_URL = "https://tiles.openfreemap.org/styles/dark";
const GOLD = "#ffb43a";
const DONE = "#ffd27a";
const HOLD = 0.4;

// Opening shot: low over Altınpark, looking down the route towards the city centre at dusk.
const OVERVIEW = { zoom: 14.1, pitch: 70, bearing: 208 };

/**
 * The home page scroll story. Performance rules (the page must stay at the
 * display's refresh rate): React renders once; scrolling only schedules one
 * requestAnimationFrame that writes styles and text straight to the DOM and
 * moves the map camera. The route reveal is a paint property, never new
 * GeoJSON, and nothing over the moving map uses backdrop blur.
 */
export default function RideStory({ route, text, appWebUrl, androidUrl, useWeb, androidDownload }: Props) {
  const rootRef = useRef<HTMLElement>(null);
  const mapEl = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const railRefs = useRef<(HTMLLIElement | null)[]>([]);
  const chipRef = useRef<HTMLDivElement>(null);
  const chipName = useRef<HTMLElement>(null);
  const chipLeft = useRef<HTMLElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);

  const path = useMemo(() => buildPath(route.path), [route.path]);
  const anchors = useMemo(() => text.steps.map((s) => route.stops[s.stop].meters), [text.steps, route.stops]);
  const stepCount = text.steps.length;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let disposed = false;
    let raf = 0;
    let top = 0;
    let span = 1;
    let vh = window.innerHeight;
    const narrow = () => window.innerWidth < 760;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Cached layout: reading it on every scroll would force style recalculation.
    const measure = () => {
      vh = window.innerHeight;
      top = root.getBoundingClientRect().top + window.scrollY;
      span = Math.max(root.offsetHeight - vh, 1);
    };
    const progress = () => clamp01((window.scrollY - top) / span);

    // ---- DOM overlay: only writes what changed ----
    const last = { step: -1, passed: -1, at: -2, left: -1, bar: -1 };
    const cardOp: number[] = [];
    const paintOverlay = (p: number, meters: number) => {
      const s = p * (stepCount - 1);
      cardRefs.current.forEach((el, i) => {
        if (!el) return;
        const o = Math.round(cardOpacity(s, i) * 100) / 100;
        if (cardOp[i] === o) return;
        cardOp[i] = o;
        el.style.opacity = String(o);
        el.style.visibility = o === 0 ? "hidden" : "visible";
        el.style.transform = `translate3d(0, ${Math.round((i - s) * 28)}px, 0)`;
      });
      const step = Math.round(s);
      if (step !== last.step) {
        last.step = step;
        root.dataset.step = String(step);
        chipRef.current?.classList.toggle("is-on", step > 0);
      }
      const bar = Math.round(p * 1000) / 1000;
      if (bar !== last.bar && barRef.current) {
        last.bar = bar;
        barRef.current.style.transform = `scaleX(${bar})`;
      }
      const o = overlayState(route.stops, meters);
      if (o.at !== last.at || o.minutesLeft !== last.left) {
        last.at = o.at;
        last.left = o.minutesLeft;
        if (chipName.current) {
          chipName.current.textContent =
            o.at >= 0 ? route.stops[o.at].name : `→ ${route.stops[o.next === -1 ? route.stops.length - 1 : o.next].name}`;
        }
        if (chipLeft.current) {
          chipLeft.current.textContent = o.minutesLeft > 0 ? text.minutesLeft.replace("{n}", String(o.minutesLeft)) : text.arrived;
        }
      }
      if (o.passed !== last.passed) {
        last.passed = o.passed;
        text.rail.forEach((stopIndex, k) => {
          const li = railRefs.current[k];
          if (!li) return;
          li.classList.toggle("is-passed", stopIndex <= o.passed);
          li.classList.toggle("is-current", stopIndex === o.passed);
        });
      }
    };

    // ---- Map (attached later) ----
    let onFrame: ((now: number, p: number) => boolean) | null = null;

    const frame = (now: number) => {
      raf = 0;
      const p = progress();
      paintOverlay(p, metersForProgress(p, anchors, HOLD));
      const moving = onFrame ? onFrame(now, p) : false;
      if (moving) raf = requestAnimationFrame(frame);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };
    const onResize = () => {
      measure();
      kick();
    };
    measure();
    kick();
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", onResize);

    // ---- Chapter paging for wheels and trackpads ----
    // Native mandatory snapping handles touch and keys. Wheels differ per browser
    // (some snap back on small deltas), so inside the story one wheel gesture
    // always moves exactly one chapter, and the gesture's inertia tail is ignored.
    const html = document.documentElement;
    let animating = false;
    let lastWheel = 0;
    let gestureUsed = false;
    const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const animateTo = (y: number) => {
      const from = window.scrollY;
      const dist = y - from;
      if (Math.abs(dist) < 1) return;
      animating = true;
      html.style.scrollSnapType = "none";
      const dur = reduced ? 0 : 720;
      const t0 = performance.now();
      const step = (now: number) => {
        const t = dur ? Math.min((now - t0) / dur, 1) : 1;
        window.scrollTo(0, from + dist * ease(t));
        if (t < 1) requestAnimationFrame(step);
        else {
          animating = false;
          html.style.scrollSnapType = "";
        }
      };
      requestAnimationFrame(step);
    };
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || Math.abs(e.deltaY) < Math.abs(e.deltaX)) return; // pinch zoom, sideways
      const y = window.scrollY;
      const end = top + span; // last chapter
      const down = e.deltaY > 0;
      // Only page inside the story, or from the last chapter on into the page below.
      if (y < top - 2 || y > end + 2 || (!down && y <= top + 2)) return;
      e.preventDefault();
      const now = performance.now();
      const quiet = now - lastWheel;
      lastWheel = now;
      if (quiet > 180) gestureUsed = false; // a pause means a new gesture
      if (animating || gestureUsed || Math.abs(e.deltaY) < 4) return;
      gestureUsed = true;
      const chapter = Math.round((y - top) / vh);
      const next = Math.min(Math.max(chapter + (down ? 1 : -1), 0), stepCount);
      animateTo(top + next * vh);
    };
    window.addEventListener("wheel", onWheel, { passive: false });

    const markers: Marker[] = [];
    let map: MlMap | undefined;

    const startMap = async () => {
      const [{ default: maplibre }, style] = await Promise.all([
        import("maplibre-gl"),
        fetch(STYLE_URL).then((r) => r.json() as Promise<StyleSpecification>),
      ]);
      if (disposed || !mapEl.current) return;

      // Keep only what the scene shows. Map labels collide with our text and
      // re-run collision detection on every camera move, so they go.
      style.layers = style.layers.filter(
        (l) => l.type !== "symbol" && !(l.paint && "fill-pattern" in l.paint) && !/landcover|landuse_residential|aeroway|housenumber/.test(l.id),
      );
      delete style.sprite;
      style.sky = {
        "sky-color": "#0a1630",
        "horizon-color": "#f59e5b",
        "fog-color": "#18213a",
        "sky-horizon-blend": 0.55,
        "horizon-fog-blend": 0.8,
        "fog-ground-blend": 0.25,
      };

      const n = narrow();
      const overview = pointAt(path, 600);
      try {
        map = new maplibre.Map({
          container: mapEl.current,
          style,
          center: overview,
          zoom: OVERVIEW.zoom,
          pitch: OVERVIEW.pitch,
          bearing: OVERVIEW.bearing,
          interactive: false,
          attributionControl: { compact: true },
          maxPitch: 78,
          fadeDuration: 0,
          renderWorldCopies: false,
          pixelRatio: Math.min(window.devicePixelRatio || 1, n ? 1.5 : 1.75),
        });
      } catch {
        return; // No WebGL: the painted dusk sky behind stays as the backdrop.
      }
      const m = map;

      m.on("load", () => {
        if (disposed) return;
        if (m.getSource("openmaptiles")) {
          m.addLayer({
            id: "gg-buildings",
            type: "fill-extrusion",
            source: "openmaptiles",
            "source-layer": "building",
            minzoom: 14,
            paint: {
              "fill-extrusion-color": ["interpolate", ["linear"], ["coalesce", ["get", "render_height"], 6], 0, "#1a2236", 40, "#2b3550"],
              "fill-extrusion-height": ["coalesce", ["get", "render_height"], 6],
              "fill-extrusion-base": ["coalesce", ["get", "render_min_height"], 0],
              "fill-extrusion-opacity": 0.9,
              "fill-extrusion-vertical-gradient": true,
            },
          });
        }
        const lineFeature = {
          type: "Feature" as const,
          properties: {},
          geometry: { type: "LineString" as const, coordinates: route.path },
        };
        m.addSource("route", { type: "geojson", data: lineFeature, lineMetrics: true });
        m.addSource("stops", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: route.stops.map((s, i) => ({
              type: "Feature",
              id: i,
              properties: {},
              geometry: { type: "Point", coordinates: [s.lon, s.lat] },
            })),
          },
        });
        const round = { "line-cap": "round", "line-join": "round" } as const;
        // The travelled part is revealed with a gradient stop that moves along
        // the line: a paint update, no new geometry for the worker to cut.
        const reveal = (frac: number, color: string) =>
          ["step", ["line-progress"], color, Math.min(Math.max(frac, 0.0001), 0.9999), "rgba(0,0,0,0)"] as ExpressionSpecification;
        m.addLayer({ id: "gg-route", type: "line", source: "route", layout: round, paint: { "line-color": GOLD, "line-width": 3.5, "line-opacity": 0.4 } });
        m.addLayer({ id: "gg-route-glow", type: "line", source: "route", layout: round, paint: { "line-width": 18, "line-opacity": 0.35, "line-blur": 10, "line-gradient": reveal(0, GOLD) } });
        m.addLayer({ id: "gg-route-done", type: "line", source: "route", layout: round, paint: { "line-width": 5.5, "line-gradient": reveal(0, DONE) } });
        m.addLayer({
          id: "gg-stops",
          type: "circle",
          source: "stops",
          paint: {
            "circle-radius": ["interpolate", ["linear"], ["zoom"], 12, 2.5, 16, 5.5],
            "circle-color": ["case", ["boolean", ["feature-state", "passed"], false], GOLD, "#0d1424"],
            "circle-stroke-color": GOLD,
            "circle-stroke-width": 1.6,
            "circle-pitch-alignment": "map",
          },
        });

        for (const i of new Set(text.steps.slice(1).map((s) => s.stop))) {
          const s = route.stops[i];
          const el = document.createElement("div");
          el.className = "rs-label";
          el.textContent = s.name;
          markers.push(new maplibre.Marker({ element: el, anchor: "top", offset: [0, 10] }).setLngLat([s.lon, s.lat]).addTo(m));
        }
        const busEl = document.createElement("div");
        busEl.className = "rs-bus";
        busEl.innerHTML = `<span class="rs-bus-pulse"></span><span class="rs-bus-dot"></span><span class="rs-bus-tag">${route.line}</span>`;
        const bus = new maplibre.Marker({ element: busEl, anchor: "center" }).setLngLat(pointAt(path, 0)).addTo(m);
        markers.push(bus);

        const target = (p: number): Cam & { meters: number; bus: [number, number] } => {
          const meters = metersForProgress(p, anchors, HOLD);
          const busAt = pointAt(path, meters);
          const s = p * (stepCount - 1);
          const lift = smootherstep(s / 0.9);
          const arrive = smootherstep(s - (stepCount - 2) - 0.3);
          const nn = narrow();
          const ride = { zoom: nn ? 15.2 : 15.5, pitch: nn ? 64 : 70 };
          const w = m.getContainer().clientWidth;
          const h = m.getContainer().clientHeight;
          const heroPad: Pad = nn ? { top: 0, bottom: h * 0.5, left: 0 } : { top: 0, bottom: 0, left: w * 0.38 };
          const ridePad: Pad = nn ? { top: 0, bottom: h * 0.42, left: 0 } : { top: h * 0.22, bottom: 0, left: w * 0.12 };
          const endPad: Pad = nn ? { top: 0, bottom: h * 0.5, left: 0 } : { top: h * 0.1, bottom: 0, left: w * 0.42 };
          const mix = (a: Pad, b: Pad, t: number): Pad => ({
            top: a.top + (b.top - a.top) * t,
            bottom: a.bottom + (b.bottom - a.bottom) * t,
            left: a.left + (b.left - a.left) * t,
          });
          const heading = headingAt(path, meters) - 35 * arrive;
          return {
            lon: overview[0] + (busAt[0] - overview[0]) * lift,
            lat: overview[1] + (busAt[1] - overview[1]) * lift,
            zoom: OVERVIEW.zoom + (ride.zoom - OVERVIEW.zoom) * lift + 0.5 * arrive,
            pitch: OVERVIEW.pitch + (ride.pitch - OVERVIEW.pitch) * lift - 6 * arrive,
            bearing: OVERVIEW.bearing + angleDelta(OVERVIEW.bearing, heading) * lift,
            pad: mix(mix(heroPad, ridePad, lift), endPad, arrive),
            meters,
            bus: busAt,
          };
        };

        const cam: Cam = (({ lon, lat, zoom, pitch, bearing, pad }) => ({ lon, lat, zoom, pitch, bearing, pad }))(target(progress()));
        let lastTime = 0;
        let lastMeters = -1;
        let passed = -1;

        onFrame = (now, p) => {
          const t = target(p);
          const dt = lastTime ? Math.min(now - lastTime, 64) : 16;
          lastTime = now;
          // Native scroll (and snapping) is already smooth; a short ease only hides wheel steps.
          const k = reduced ? 1 : 1 - Math.exp(-dt / 70);
          cam.lon += (t.lon - cam.lon) * k;
          cam.lat += (t.lat - cam.lat) * k;
          cam.zoom += (t.zoom - cam.zoom) * k;
          cam.pitch += (t.pitch - cam.pitch) * k;
          cam.bearing += angleDelta(cam.bearing, t.bearing) * k;
          cam.pad = {
            top: cam.pad.top + (t.pad.top - cam.pad.top) * k,
            bottom: cam.pad.bottom + (t.pad.bottom - cam.pad.bottom) * k,
            left: cam.pad.left + (t.pad.left - cam.pad.left) * k,
          };
          m.jumpTo({ center: [cam.lon, cam.lat], zoom: cam.zoom, pitch: cam.pitch, bearing: cam.bearing, padding: { ...cam.pad, right: 0 } });
          bus.setLngLat(t.bus);

          if (Math.abs(t.meters - lastMeters) > 2) {
            lastMeters = t.meters;
            const frac = t.meters / path.length;
            m.setPaintProperty("gg-route-done", "line-gradient", reveal(frac, DONE));
            m.setPaintProperty("gg-route-glow", "line-gradient", reveal(frac, GOLD));
            const nowPassed = overlayState(route.stops, t.meters).passed;
            if (nowPassed !== passed) {
              const from = Math.min(passed, nowPassed) + 1;
              const to = Math.max(passed, nowPassed);
              for (let i = Math.max(from, 0); i <= to; i++) m.setFeatureState({ source: "stops", id: i }, { passed: i <= nowPassed });
              passed = nowPassed;
            }
          }
          const moving =
            Math.abs(t.lon - cam.lon) > 1e-7 ||
            Math.abs(t.lat - cam.lat) > 1e-7 ||
            Math.abs(t.zoom - cam.zoom) > 1e-3 ||
            Math.abs(t.pitch - cam.pitch) > 1e-2 ||
            Math.abs(angleDelta(cam.bearing, t.bearing)) > 0.02 ||
            Math.abs(t.pad.left - cam.pad.left) > 0.5 ||
            Math.abs(t.pad.bottom - cam.pad.bottom) > 0.5;
          if (!moving) lastTime = 0;
          return moving;
        };
        kick();
        const show = () => !disposed && root.setAttribute("data-map", "ready");
        m.once("idle", show);
        setTimeout(show, 1500);
      });
    };

    // The map is decoration: start it after the page has painted and the browser is idle.
    const idle = (cb: () => void) => {
      if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(cb, { timeout: 1500 });
      else setTimeout(cb, 300);
    };
    const begin = () => idle(() => void startMap());
    if (document.readyState === "complete") begin();
    else window.addEventListener("load", begin, { once: true });

    return () => {
      disposed = true;
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("load", begin);
      html.style.scrollSnapType = "";
      markers.forEach((mk) => mk.remove());
      map?.remove();
    };
  }, [path, anchors, stepCount, route, text]);

  const scrollToStep = (i: number) => {
    const el = rootRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + i * window.innerHeight, behavior: "smooth" });
  };
  const stepOfStop = (stopIndex: number) => text.steps.findIndex((st, i) => i > 0 && st.stop === stopIndex);
  const hidden = { opacity: 0, visibility: "hidden" as const, transform: "translate3d(0, 28px, 0)" };
  const cardRef = (i: number) => (el: HTMLDivElement | null) => {
    cardRefs.current[i] = el;
  };

  return (
    <section ref={rootRef} className="rs" style={{ height: `${stepCount * 100}svh` }} data-step="0">
      <div className="rs-stage">
        <div className="rs-sky" aria-hidden="true" />
        <div ref={mapEl} className="rs-map" aria-hidden="true" />
        <div className="rs-vignette" aria-hidden="true" />
        <div className="rs-hero-scrim" aria-hidden="true" />

        <div ref={chipRef} className="rs-chip" aria-hidden="true">
          <span className="rs-chip-line">{route.line}</span>
          <span className="rs-chip-text">
            <strong ref={chipName}>{route.stops[0].name}</strong>
            <small ref={chipLeft}>{text.minutesLeft.replace("{n}", String(route.stops[route.stops.length - 1].minute))}</small>
          </span>
        </div>

        <ol className="rs-rail" aria-hidden="true">
          {text.rail.map((stopIndex, k) => {
            const st = route.stops[stopIndex];
            const target = stepOfStop(stopIndex);
            return (
              <li
                key={st.id}
                ref={(el) => {
                  railRefs.current[k] = el;
                }}
                className={stopIndex === 0 ? "is-passed is-current" : ""}
              >
                <button type="button" tabIndex={-1} onClick={() => target > 0 && scrollToStep(target)} disabled={target <= 0}>
                  <span className="rs-rail-name">{st.name}</span>
                  <span className="rs-rail-dot" />
                </button>
              </li>
            );
          })}
        </ol>

        <div className="rs-progress" aria-hidden="true">
          <span ref={barRef} />
        </div>

        {text.steps.map((step, i) => {
          if (step.overview) {
            return (
              <div key={i} ref={cardRef(i)} className="rs-scene rs-hero">
                <div className="rs-hero-inner">
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
              <div key={i} ref={cardRef(i)} className="rs-scene rs-final" style={hidden}>
                <div className="rs-card">
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
            <div key={i} ref={cardRef(i)} className="rs-scene rs-chapter" style={hidden}>
              <div className="rs-copy">
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

      {/* One full-screen snap point per chapter: a single wheel turn or swipe moves one chapter. */}
      <div className="rs-snaps" aria-hidden="true">
        {text.steps.map((_, i) => (
          <div key={i} className="rs-snap" />
        ))}
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
