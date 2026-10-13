import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CITIES, isEnabledLang } from "@/lib/config";
import { GUIDES, copyFor } from "@/content/guides";
import { guideUi } from "@/lib/guide-text";
import { getStrings } from "@/lib/strings";
import { alternatesFor } from "@/lib/urls";

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
    <main>
      <nav className="muted"><a href={`/${lang}`}>{u.home}</a> › {u.guides}</nav>
      <h1>{u.allGuides}</h1>
      <p>{u.guidesIntro}</p>
      {CITIES.map((city) => (
        <section key={city}>
          <h2>{s.cities[city]}</h2>
          <ul>
            {GUIDES.filter((g) => g.city === city).map((g) => (
              <li key={g.slug}><a href={`/${lang}/guides/${g.slug}`}>{copyFor(g, lang).title}</a></li>
            ))}
          </ul>
        </section>
      ))}
      <footer><p className="muted">{s.disclaimer}</p></footer>
    </main>
  );
}
