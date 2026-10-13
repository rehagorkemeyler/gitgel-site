import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { GUIDES, copyFor, guideBySlug } from "@/content/guides";
import { APP_ANDROID_URL, APP_WEB_URL, SITE_URL, isEnabledLang } from "@/lib/config";
import { getLineDetail, getLines, getStops, type LineDetail } from "@/lib/data";
import { formatDate, guideUi, statsSentence } from "@/lib/guide-text";
import { pickDerivedLines, relatedGuides, summarizeLines } from "@/lib/guide-stats";
import { formatRange } from "@/lib/pages-text";
import { getStrings } from "@/lib/strings";
import { alternatesFor, linePath, stopPath } from "@/lib/urls";

export const revalidate = 86400;
export function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ lang: string; slug: string }> };

const MAX_DERIVED_LINES = 8;
const RELATED_COUNT = 6;

const load = cache(async (slug: string) => {
  const guide = guideBySlug(slug);
  if (!guide) return null;
  const [allStops, lineMeta] = await Promise.all([getStops(guide.city), getLines(guide.city)]);
  const stops = guide.stops.flatMap((id) => allStops.find((s) => s.id === id) ?? []);
  const lineIds = guide.lines.length
    ? guide.lines
    : pickDerivedLines(stops, lineMeta, MAX_DERIVED_LINES);
  const settled = await Promise.allSettled(
    lineIds.filter((id) => lineMeta.has(id)).map((id) => getLineDetail(guide.city, id)),
  );
  const details: LineDetail[] = settled.flatMap((r) => (r.status === "fulfilled" ? [r.value] : []));
  return { guide, stops, details, lineMeta };
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  const data = isEnabledLang(lang) ? await load(slug) : null;
  if (!data || !isEnabledLang(lang)) return {};
  const c = copyFor(data.guide, lang);
  return {
    title: `${c.title} · GitGel`,
    description: c.description,
    alternates: alternatesFor(lang, (l) => `/${l}/guides/${slug}`),
  };
}

export default async function GuidePage({ params }: Props) {
  const { lang, slug } = await params;
  if (!isEnabledLang(lang)) notFound();
  const data = await load(slug);
  if (!data) notFound();
  const { guide, stops, details, lineMeta } = data;
  const c = copyFor(guide, lang);
  const u = guideUi(lang);
  const s = getStrings(lang);
  const summary = statsSentence(lang, summarizeLines(details));
  const url = `${SITE_URL}/${lang}/guides/${slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: c.title,
    description: c.description,
    inLanguage: lang,
    datePublished: guide.updated,
    dateModified: guide.updated,
    mainEntityOfPage: url,
    author: { "@type": "Organization", name: "GitGel" },
    publisher: { "@type": "Organization", name: "GitGel" },
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <nav className="muted">
        <a href={`/${lang}`}>{u.home}</a> › <a href={`/${lang}/guides`}>{u.guides}</a> › {s.cities[guide.city]}
      </nav>
      <h1>{c.title}</h1>
      <p className="muted">{u.updated}: <time dateTime={guide.updated}>{formatDate(lang, guide.updated)}</time></p>
      <p>{c.intro}</p>
      <ul className="buttons">
        <li><a className="btn" href={APP_WEB_URL}>{s.useWeb}</a></li>
        <li><a className="btn secondary" href={APP_ANDROID_URL}>{s.androidDownload}</a></li>
      </ul>

      {c.sections.map((sec) => (
        <section key={sec.heading}>
          <h2>{sec.heading}</h2>
          {sec.paragraphs.map((p) => <p key={p}>{p}</p>)}
        </section>
      ))}

      {details.length > 0 && (
        <section>
          <h2>{u.numbersHeading}</h2>
          {summary && <p>{summary}</p>}
          <ul className="guidelines">
            {details.map((l) => (
              <li key={l.id}>
                <a href={linePath(lang, guide.city, l.id)}><strong>{l.name}</strong></a>
                <span className="muted"> {lineMeta.get(l.id)?.long_name}</span>
                <ul>
                  {l.directions.map((d, i) => (
                    <li key={d.headsign + i}>
                      → {d.headsign}: {formatRange(lang, d.first_last.weekday) ?? "–"}
                      {d.offsets.length > 0 && <span className="muted"> · {Math.max(...d.offsets)} {u.min} · {d.stops.length} {u.stopsCount}</span>}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
          <p className="muted">{u.weekday}. {u.scheduleNote}</p>
        </section>
      )}

      {stops.length > 0 && (
        <section>
          <h2>{u.stopsHeading}</h2>
          <ul>
            {stops.map((st) => (
              <li key={st.id}>
                <a href={stopPath(lang, guide.city, st.id, st.name)}>{st.name}</a>
                <span className="muted"> · {st.lines.slice(0, 6).map((id) => lineMeta.get(id)?.name ?? id).join(", ")}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2>{u.moreGuides}</h2>
        <ul>
          {relatedGuides(GUIDES, guide, RELATED_COUNT).map((g) => (
            <li key={g.slug}><a href={`/${lang}/guides/${g.slug}`}>{copyFor(g, lang).title}</a></li>
          ))}
        </ul>
      </section>
      <footer><p className="muted">{s.disclaimer}</p></footer>
    </main>
  );
}
