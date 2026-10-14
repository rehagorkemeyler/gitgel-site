import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import { notFound } from "next/navigation";
import { preconnect } from "react-dom";
import RideStory from "@/components/RideStory";
import routeJson from "@/content/landing-route.json";
import { APP_ANDROID_URL, APP_WEB_URL, CITIES, appCityUrl, ENABLED_LANGS, isEnabledLang, type City } from "@/lib/config";
import { getLines, getStops } from "@/lib/data";
import { landingText, type RideRoute } from "@/lib/landing";
import { getStrings } from "@/lib/strings";
import "maplibre-gl/dist/maplibre-gl.css";
import "./landing.css";

const display = Bricolage_Grotesque({ subsets: ["latin", "latin-ext"], weight: ["800"], variable: "--font-display" });

export const revalidate = 86400;

type Props = { params: Promise<{ lang: string }> };

const route = routeJson as RideRoute;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isEnabledLang(lang)) return {};
  const t = getStrings(lang);
  return {
    title: t.title,
    description: t.description,
    alternates: {
      canonical: `/${lang}`,
      languages: Object.fromEntries(ENABLED_LANGS.map((l) => [l, `/${l}`])),
    },
    openGraph: { title: t.title, description: t.description, type: "website" },
  };
}

// Stop and line counts per city; the page still renders without them if the source is down.
async function cityCounts(): Promise<Partial<Record<City, { stops: number; lines: number }>>> {
  const entries = await Promise.all(
    CITIES.map(async (city) => {
      try {
        const [stops, lines] = await Promise.all([getStops(city), getLines(city)]);
        return [city, { stops: stops.length, lines: lines.size }] as const;
      } catch {
        return null;
      }
    }),
  );
  return Object.fromEntries(entries.filter((e) => e !== null));
}

const CITY_ART: Record<City, { hue: string; note: Record<"tr" | "en", string> }> = {
  istanbul: { hue: "istanbul", note: { tr: "Metrobüs, Marmaray, vapur", en: "Metrobüs, Marmaray, ferries" } },
  ankara: { hue: "ankara", note: { tr: "EGO otobüsleri, Ankaray, metro", en: "EGO buses, Ankaray, metro" } },
  bursa: { hue: "bursa", note: { tr: "BursaRay, teleferik, otobüs", en: "BursaRay, cable car, buses" } },
};

const icon = (d: string) => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
);
// Directions, trip tracking, nearby, crowding, free.
const FEATURE_ICONS = [
  icon("M6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM18 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM6 15V9a4 4 0 0 1 4-4h2M18 9v6a4 4 0 0 1-4 4h-2"),
  icon("M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12ZM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"),
  icon("M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12 3v3M12 18v3M3 12h3M18 12h3"),
  icon("M16 19v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 17.5V19M10 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM20 19v-1.5a3.5 3.5 0 0 0-2.5-3.35M15.5 5.15a3 3 0 0 1 0 5.7"),
  icon("M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8ZM7.5 7.5h.01"),
];

export default async function Home({ params }: Props) {
  const { lang } = await params;
  if (!isEnabledLang(lang)) notFound();
  preconnect("https://tiles.openfreemap.org", { crossOrigin: "anonymous" });
  const t = getStrings(lang);
  const l = landingText(lang, route);
  const counts = await cityCounts();
  const fmt = new Intl.NumberFormat(lang === "tr" ? "tr-TR" : "en-GB");
  const noteLang = lang === "tr" ? "tr" : "en";

  return (
    <main className={`lp ${display.variable}`}>
      <header className="lp-top">
        <a className="lp-logo" href={`/${lang}`} aria-label="GitGel">
          <svg className="lp-logo-mark" viewBox="0 0 512 512" width="34" height="34" aria-hidden="true">
            <defs>
              <mask id="gg-logo-cut">
                <rect width="512" height="512" fill="#fff" />
                <path d="M168 344 L222 296 H268 L316.4 214.4" fill="none" stroke="#000" strokeWidth="30" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="168" cy="344" r="56" fill="#000" />
                <path fill="#000" fillRule="evenodd" d="M290 168a54 54 0 1 0 108 0a54 54 0 1 0 -108 0Z M320 168a24 24 0 1 0 48 0a24 24 0 1 0 -48 0Z" />
              </mask>
            </defs>
            <rect width="512" height="512" rx="115" fill="currentColor" mask="url(#gg-logo-cut)" />
          </svg>
          GitGel
        </a>
        <nav className="lp-nav" aria-label={lang === "tr" ? "Dil" : "Language"}>
          <a href={`/${lang}/guides`} className="lp-nav-link">{l.guides}</a>
          {ENABLED_LANGS.map((code) => (
            <a key={code} href={`/${code}`} className={code === lang ? "is-on" : ""} hrefLang={code} lang={code}>
              {code.toUpperCase()}
            </a>
          ))}
        </nav>
      </header>

      <RideStory
        route={route}
        text={l}
        appWebUrl={APP_WEB_URL}
        androidUrl={APP_ANDROID_URL}
        useWeb={t.useWeb}
        androidDownload={t.androidDownload}
      />

      <div className="lp-rest">
      <section className="lp-section" aria-labelledby="lp-features">
        <h2 id="lp-features" className="lp-h2">{l.sectionFeatures}</h2>
        <div className="lp-grid">
          {l.features.map((f, i) => (
            <article key={f.title} className={`lp-feature ${i === 0 ? "lp-feature-live" : ""}`}>
              {i === 0 ? (
                <div className="lp-metro" aria-hidden="true">
                  <span className="lp-metro-track" />
                  {[0, 1, 2, 3, 4].map((k) => <span key={k} className="lp-metro-station" style={{ left: `${8 + k * 21}%` }} />)}
                  <span className="lp-metro-train" />
                  <span className="lp-metro-train lp-metro-train-b" />
                </div>
              ) : (
                <span className="lp-icon" aria-hidden="true">{FEATURE_ICONS[i - 1]}</span>
              )}
              {f.tag && <span className="lp-live"><i />{f.tag}</span>}
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="lp-section" aria-labelledby="lp-cities">
        <h2 id="lp-cities" className="lp-h2">{l.sectionCities}</h2>
        <ul className="lp-cities">
          {CITIES.map((city) => {
            const c = counts[city];
            return (
              <li key={city}>
                <a className={`lp-city lp-city-${CITY_ART[city].hue}`} href={appCityUrl(city)}>
                  <span className="lp-city-name">{t.cities[city]}</span>
                  <span className="lp-city-note">{CITY_ART[city].note[noteLang]}</span>
                  {c && (
                    <span className="lp-city-stats">
                      <b>{fmt.format(c.stops)}</b> {l.stopsWord} · <b>{fmt.format(c.lines)}</b> {l.linesWord}
                    </span>
                  )}
                  <span className="lp-city-arrow" aria-hidden="true">→</span>
                </a>
              </li>
            );
          })}
        </ul>
        <a className="lp-guides" href={`/${lang}/guides`}>
          <span>
            <b>{l.guides}</b>
            {l.guidesBody}
          </span>
          <span aria-hidden="true">→</span>
        </a>
      </section>

      <section className="lp-closing">
        <h2>{l.closing}</h2>
        <p>{l.closingBody}</p>
        <div className="rs-ctas">
          <a className="rs-btn rs-btn-gold" href={APP_WEB_URL}>{t.useWeb}</a>
          <a className="rs-btn rs-btn-glass" href={APP_ANDROID_URL}>{t.androidDownload}</a>
        </div>
      </section>

      <footer className="lp-footer">
        <p>{t.pitch}</p>
        <p>{t.disclaimer}</p>
        <p className="lp-footer-links">
          {CITIES.map((city) => (
            <a key={city} href={`/${lang}/${city}`}>
              {lang === "tr" ? `${t.cities[city]} hatları ve durakları` : `${t.cities[city]} lines and stops`}
            </a>
          ))}
          <a href={`/${lang}/guides`}>{l.guides}</a>
        </p>
        <p className="lp-credits">
          {lang === "tr" ? "Harita" : "Map"}: © OpenStreetMap, OpenFreeMap, OpenMapTiles · {lang === "tr" ? "Rota" : "Route"}: OSRM
        </p>
      </footer>
      </div>
    </main>
  );
}
