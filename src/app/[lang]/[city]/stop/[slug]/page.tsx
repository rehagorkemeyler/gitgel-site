import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { cache } from "react";
import {
  APP_ANDROID_URL, APP_WEB_URL, CITIES, ENABLED_LANGS, SITE_URL, isEnabledLang,
  type City, type Lang,
} from "@/lib/config";
import { getLineDetail, getLines, getStops, type LineDetail } from "@/lib/data";
import { stopText } from "@/lib/sentences";
import { parseStopSegment, stopSegment } from "@/lib/slug";
import { buildStopView } from "@/lib/stop-view";
import { getStrings } from "@/lib/strings";

export const revalidate = 86400;
// Render on first request, then cache; only the home pages are prerendered.
export function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ lang: string; city: string; slug: string }> };

const MAX_DETAIL_LINES = 12;

const loadView = cache(async (city: City, segment: string) => {
  const { code } = parseStopSegment(segment);
  const stops = await getStops(city);
  const stop = stops.find((s) => s.id === code);
  if (!stop) return null;
  const lineMeta = await getLines(city);
  const settled = await Promise.allSettled(
    stop.lines.slice(0, MAX_DETAIL_LINES).map((id) => getLineDetail(city, id)),
  );
  const details = new Map<string, LineDetail>();
  for (const r of settled) if (r.status === "fulfilled") details.set(r.value.id, r.value);
  return buildStopView(stop, stops, lineMeta, details);
});

function parse(p: { lang: string; city: string }): { lang: Lang; city: City } {
  if (!isEnabledLang(p.lang) || !(CITIES as readonly string[]).includes(p.city)) notFound();
  return { lang: p.lang, city: p.city as City };
}

const pathFor = (lang: Lang, city: City, segment: string) => `/${lang}/${city}/stop/${segment}`;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await params;
  const { lang, city } = parse(p);
  const view = await loadView(city, p.slug);
  if (!view) return {};
  const seg = stopSegment(view.stop.id, view.stop.name);
  const t = stopText(lang, view, view.stop.id, city);
  return {
    title: t.title,
    description: t.description,
    alternates: {
      canonical: pathFor(lang, city, seg),
      languages: {
        ...Object.fromEntries(ENABLED_LANGS.map((l) => [l, pathFor(l, city, seg)])),
        "x-default": pathFor("tr", city, seg),
      },
    },
  };
}

const SCHEMA_TYPE: Record<string, string> = {
  bus: "BusStop", metrobus: "BusStop", tram: "BusStop", metro: "SubwayStation",
  rail: "TrainStation", ferry: "CivicStructure", cablecar: "CivicStructure", funicular: "CivicStructure",
};

export default async function StopPage({ params }: Props) {
  const p = await params;
  const { lang, city } = parse(p);
  const view = await loadView(city, p.slug);
  if (!view) notFound();
  const seg = stopSegment(view.stop.id, view.stop.name);
  if (p.slug !== seg) permanentRedirect(pathFor(lang, city, seg));

  const t = stopText(lang, view, view.stop.id, city);
  const ui = getStrings(lang);
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": SCHEMA_TYPE[view.stop.mode] ?? "CivicStructure",
      name: t.h1,
      url: `${SITE_URL}${pathFor(lang, city, seg)}`,
      geo: { "@type": "GeoCoordinates", latitude: view.stop.lat, longitude: view.stop.lon },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: t.home, item: `${SITE_URL}/${lang}` },
        { "@type": "ListItem", position: 2, name: t.h1 },
      ],
    },
  ];

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <nav className="muted"><a href={`/${lang}`}>{t.home}</a> › {ui.cities[city]}</nav>
      <h1>{t.h1}</h1>
      <p>{t.intro}</p>
      <ul className="buttons">
        <li><a className="btn" href={APP_WEB_URL}>{ui.useWeb}</a></li>
        <li><a className="btn secondary" href={APP_ANDROID_URL}>{ui.androidDownload}</a></li>
      </ul>

      <h2>{t.linesHeading}</h2>
      {view.lines.map((l) => {
        const sentences = t.lineSentences.find((s) => s.lineId === l.id);
        return (
          <section key={l.id}>
            <h3>{sentences?.heading}</h3>
            {sentences?.sentences.map((s) => <p key={s}>{s}</p>)}
          </section>
        );
      })}
      <p className="muted">{t.scheduleNote}</p>

      {t.oppositeSentence && <p>{t.oppositeSentence}</p>}

      {t.nearbyItems.length > 0 && (
        <>
          <h2>{t.nearbyHeading}</h2>
          <ul>
            {t.nearbyItems.map((n) => (
              <li key={n.stopId}>
                <a href={pathFor(lang, city, stopSegment(n.stopId, n.label))}>{n.label}</a>
                <span className="muted"> · {n.detail}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      <h2>{t.appHeading}</h2>
      <ul className="buttons">
        <li><a className="btn" href={APP_WEB_URL}>{ui.useWeb}</a></li>
        <li><a className="btn secondary" href={APP_ANDROID_URL}>{ui.androidDownload}</a></li>
      </ul>
      <footer><p className="muted">{ui.disclaimer}</p></footer>
    </main>
  );
}
