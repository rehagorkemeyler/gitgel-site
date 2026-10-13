import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_ANDROID_URL, APP_WEB_URL, CITIES, ENABLED_LANGS, isEnabledLang } from "@/lib/config";
import { getStrings } from "@/lib/strings";

type Props = { params: Promise<{ lang: string }> };

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
  };
}

export default async function Home({ params }: Props) {
  const { lang } = await params;
  if (!isEnabledLang(lang)) notFound();
  const t = getStrings(lang);
  return (
    <main>
      <h1>{t.siteName}</h1>
      <p>{t.pitch}</p>
      <ul className="buttons">
        <li><a className="btn" href={APP_WEB_URL}>{t.useWeb}</a></li>
        <li><a className="btn secondary" href={APP_ANDROID_URL}>{t.androidDownload}</a></li>
      </ul>
      <h2>{t.chooseCity}</h2>
      <ul className="cities">
        {CITIES.map((city) => (
          <li key={city}><a className="city" href={`/${lang}/${city}`}>{t.cities[city]}</a></li>
        ))}
      </ul>
      <p><a href={`/${lang}/guides`}>{lang === "tr" ? "Havalimanı, kampüs ve vapur rehberleri" : "Airport, campus and ferry guides"}</a></p>
      <footer>
        <p className="muted">{t.scheduleNote}</p>
        <p className="muted">{t.disclaimer}</p>
      </footer>
    </main>
  );
}
