import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppCta, StickyAppBar } from "@/components/AppCta";
import { APP_ANDROID_URL, APP_WEB_URL, CITIES, isEnabledLang } from "@/lib/config";
import { GUIDES, copyFor } from "@/content/guides";
import { guideUi } from "@/lib/guide-text";
import { getStrings } from "@/lib/strings";
import { alternatesFor } from "@/lib/urls";
import "./guides.css";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isEnabledLang(lang)) return {};
  const u = guideUi(lang);
  return {
    title: `${u.allGuides} · GitGel`,
    description: u.guidesIntro,
    alternates: alternatesFor(lang, (l) => `/${l}/guides`),
  };
}

export default async function GuidesIndex({ params }: Props) {
  const { lang } = await params;
  if (!isEnabledLang(lang)) notFound();
  const u = guideUi(lang);
  const s = getStrings(lang);
  return (
    <main className="g">
      <nav className="g-crumbs" aria-label="Breadcrumb"><a href={`/${lang}`}>{u.home}</a> › <span>{u.guides}</span></nav>
      <header className="g-hero city-ankara">
        <h1>{u.allGuides}</h1>
        <p className="g-hero-intro">{u.guidesIntro}</p>
        <nav className="g-index-nav">
          {CITIES.map((city) => (
            <a key={city} href={`#${city}`} className={`g-chip city-${city}`}>{s.cities[city]}</a>
          ))}
        </nav>
      </header>

      <AppCta ui={u} webUrl={APP_WEB_URL} androidUrl={APP_ANDROID_URL} useWeb={s.useWeb} androidDownload={s.androidDownload} body={u.ctaBodyIndex} />

      {CITIES.map((city) => {
        const list = GUIDES.filter((g) => g.city === city);
        return (
          <section key={city} id={city} className={`city-${city}`}>
            <div className="g-city-head">
              <h2>{s.cities[city]}</h2>
              <span className="muted">{list.length} {u.guidesCount}</span>
            </div>
            <ul className="g-cards">
              {list.map((g) => {
                const gc = copyFor(g, lang);
                return (
                  <li key={g.slug}>
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
        );
      })}
      <footer className="g-footer"><p className="muted">{s.disclaimer}</p></footer>
      <StickyAppBar text={u.stickyText} webUrl={APP_WEB_URL} useWeb={s.useWeb} />
    </main>
  );
}
