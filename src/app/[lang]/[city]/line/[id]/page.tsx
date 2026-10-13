import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { APP_ANDROID_URL, APP_WEB_URL, SITE_URL, type City } from "@/lib/config";
import { getLineDetail, getLines, getStops } from "@/lib/data";
import { buildLineView } from "@/lib/line-view";
import { parseLangCity } from "@/lib/params";
import { lineText, ui } from "@/lib/pages-text";
import { getStrings } from "@/lib/strings";
import { alternatesFor, cityPath, linePath, stopPath } from "@/lib/urls";

export const revalidate = 86400;
export function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ lang: string; city: string; id: string }> };

const loadView = cache(async (city: City, rawId: string) => {
  const id = decodeURIComponent(rawId);
  const lines = await getLines(city);
  if (!lines.has(id)) return null;
  const [detail, stops] = await Promise.all([getLineDetail(city, id), getStops(city)]);
  return buildLineView(detail, new Map(stops.map((s) => [s.id, s])));
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await params;
  const { lang, city } = parseLangCity(p);
  const view = await loadView(city, p.id);
  if (!view) return {};
  const t = lineText(lang, view, city);
  return {
    title: t.title,
    description: t.description,
    alternates: alternatesFor(lang, (l) => linePath(l, city, view.line.id)),
  };
}

export default async function LinePage({ params }: Props) {
  const p = await params;
  const { lang, city } = parseLangCity(p);
  const view = await loadView(city, p.id);
  if (!view) notFound();
  const t = lineText(lang, view, city);
  const u = ui(lang);
  const s = getStrings(lang);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: t.h1,
    url: `${SITE_URL}${linePath(lang, city, view.line.id)}`,
    numberOfItems: view.uniqueStops.length,
    itemListElement: view.uniqueStops.map((st, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: st.name,
      url: `${SITE_URL}${stopPath(lang, city, st.id, st.name)}`,
    })),
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <nav className="muted">
        <a href={`/${lang}`}>{u.home}</a> › <a href={cityPath(lang, city)}>{s.cities[city]}</a> › {view.line.name}
      </nav>
      <h1>{t.h1}</h1>
      <p>{t.intro}</p>
      <ul className="buttons">
        <li><a className="btn" href={APP_WEB_URL}>{s.useWeb}</a></li>
        <li><a className="btn secondary" href={APP_ANDROID_URL}>{s.androidDownload}</a></li>
      </ul>

      {view.directions.map((d, i) => (
        <section key={d.headsign + i}>
          <h2>{t.directions[i].heading}</h2>
          <p>{t.directions[i].sentence}</p>
          {t.directions[i].times.length > 0 && (
            <>
              <h3>{u.times}</h3>
              <ul>
                {t.directions[i].times.map((x) => (
                  <li key={x.label}>{x.label}: {x.value}</li>
                ))}
              </ul>
            </>
          )}
          <h3>{u.stopList}</h3>
          <ol>
            {d.rows.map((r, j) => (
              <li key={r.stop.id + j}>
                <a href={stopPath(lang, city, r.stop.id, r.stop.name)}>{r.stop.name}</a>
                <span className="muted"> · +{r.minutes} {u.minutesShort}</span>
              </li>
            ))}
          </ol>
        </section>
      ))}
      <p className="muted">{u.scheduleNote} {u.timesNote}</p>

      <h2>{u.appHeading}</h2>
      <ul className="buttons">
        <li><a className="btn" href={APP_WEB_URL}>{s.useWeb}</a></li>
        <li><a className="btn secondary" href={APP_ANDROID_URL}>{s.androidDownload}</a></li>
      </ul>
      <footer><p className="muted">{s.disclaimer}</p></footer>
    </main>
  );
}
