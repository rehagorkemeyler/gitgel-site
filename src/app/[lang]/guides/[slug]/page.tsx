import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { GUIDES, copyFor, guideBySlug } from "@/content/guides";
import { AppCta, StickyAppBar } from "@/components/AppCta";
import { APP_ANDROID_URL, SITE_URL, appCityUrl, isEnabledLang } from "@/lib/config";
import { getLineDetail, getLines, getStops, type LineDetail } from "@/lib/data";
import { formatDate, guideUi, statsSentence } from "@/lib/guide-text";
import { pickDerivedLines, relatedGuides, summarizeLines } from "@/lib/guide-stats";
import { formatRange } from "@/lib/pages-text";
import { getStrings } from "@/lib/strings";
import { alternatesFor, linePath, stopPath } from "@/lib/urls";
import "../guides.css";

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

  const webUrl = appCityUrl(guide.city);

  return (
    <main className={`g city-${guide.city}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <nav className="g-crumbs" aria-label="Breadcrumb">
        <a href={`/${lang}`}>{u.home}</a> › <a href={`/${lang}/guides`}>{u.guides}</a> › <span>{s.cities[guide.city]}</span>
      </nav>

      <header className="g-hero">
        <h1>{c.title}</h1>
        <p className="g-hero-intro">{c.intro}</p>
        <p className="g-meta">
          <span className="g-chip">{s.cities[guide.city]}</span>
          <span>{u.updated}: <time dateTime={guide.updated}>{formatDate(lang, guide.updated)}</time></span>
        </p>
      </header>

      <AppCta ui={u} webUrl={webUrl} androidUrl={APP_ANDROID_URL} useWeb={s.useWeb} androidDownload={s.androidDownload} />

      <article className="g-article">
        {c.sections.map((sec) => (
          <section key={sec.heading}>
            <h2>{sec.heading}</h2>
            {sec.paragraphs.map((p) => <p key={p}>{p}</p>)}
          </section>
        ))}
      </article>

      {details.length > 0 && (
        <section className="g-block">
          <h2>{u.numbersHeading}</h2>
          {summary && <p>{summary}</p>}
          <ul className="g-lines">
            {details.map((l) => (
              <li key={l.id} className={`g-line mode-${l.mode}`}>
                <div className="g-line-head">
                  <a className="g-badge" href={linePath(lang, guide.city, l.id)}>{l.name}</a>
                  <span className="g-line-name">{lineMeta.get(l.id)?.long_name}</span>
                </div>
                <ul className="g-dirs">
                  {l.directions.map((d, i) => (
                    <li key={d.headsign + i} className="g-dir">
                      <span className="g-dir-to">→ {d.headsign}</span>
                      <span className="g-dir-time">
                        {formatRange(lang, d.first_last.weekday) ?? "–"}
                        {d.offsets.length > 0 && <small> · {Math.max(...d.offsets)} {u.min} · {d.stops.length} {u.stopsCount}</small>}
                      </span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
          <p className="g-note">{u.weekday}. {u.scheduleNote}</p>
        </section>
      )}

      <div className="g-band">
        <strong><span className="g-live-dot" aria-hidden="true" />{u.midCtaTitle}</strong>
        <a href={webUrl}>{s.useWeb}</a>
      </div>

      {stops.length > 0 && (
        <section className="g-block">
          <h2>{u.stopsHeading}</h2>
          <ul className="g-stops">
            {stops.map((st) => (
              <li key={st.id}>
                <a className="g-stop" href={stopPath(lang, guide.city, st.id, st.name)}>
                  {st.name}
                  <small>{st.lines.slice(0, 6).map((id) => lineMeta.get(id)?.name ?? id).join(", ")}</small>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="g-block">
        <h2>{u.moreGuides}</h2>
        <ul className="g-cards">
          {relatedGuides(GUIDES, guide, RELATED_COUNT).map((g) => {
            const gc = copyFor(g, lang);
            return (
              <li key={g.slug} className={`city-${g.city}`}>
                <a className="g-card" href={`/${lang}/guides/${g.slug}`}>
                  <span className="g-card-title">{gc.title}</span>
                  <span className="g-card-desc">{gc.description}</span>
                  <span className="g-card-more">{u.readGuide} →</span>
                </a>
              </li>
            );
          })}
        </ul>
      </section>

      <footer className="g-footer"><p className="muted">{s.disclaimer}</p></footer>
      <StickyAppBar text={u.stickyText} webUrl={webUrl} useWeb={s.useWeb} />
    </main>
  );
}
