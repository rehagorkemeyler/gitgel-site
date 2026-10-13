import type { Metadata } from "next";
import { APP_ANDROID_URL, APP_WEB_URL, type City } from "@/lib/config";
import { getLines, getStops } from "@/lib/data";
import { LETTER_KEYS, groupLinesByMode, letterKey } from "@/lib/listing";
import { parseLangCity } from "@/lib/params";
import { cityText, ui } from "@/lib/pages-text";
import { getStrings } from "@/lib/strings";
import { alternatesFor, cityPath, letterPath, linePath, searchPath } from "@/lib/urls";

export const revalidate = 86400;
export function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ lang: string; city: string }> };

async function load(city: City) {
  const [stops, linesMap] = await Promise.all([getStops(city), getLines(city)]);
  return { stops, lines: [...linesMap.values()] };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, city } = parseLangCity(await params);
  const { stops, lines } = await load(city);
  const t = cityText(lang, city, lines, stops.length);
  return {
    title: t.title,
    description: t.description,
    alternates: alternatesFor(lang, (l) => cityPath(l, city)),
  };
}

export default async function CityPage({ params }: Props) {
  const { lang, city } = parseLangCity(await params);
  const { stops, lines } = await load(city);
  const t = cityText(lang, city, lines, stops.length);
  const u = ui(lang);
  const s = getStrings(lang);
  const present = new Set(stops.map((x) => letterKey(x.name)));
  const groups = groupLinesByMode(lines);

  return (
    <main>
      <nav className="muted"><a href={`/${lang}`}>{u.home}</a> › {s.cities[city]}</nav>
      <h1>{t.h1}</h1>
      <p>{t.intro}</p>
      <ul className="buttons">
        <li><a className="btn" href={APP_WEB_URL}>{s.useWeb}</a></li>
        <li><a className="btn secondary" href={APP_ANDROID_URL}>{s.androidDownload}</a></li>
      </ul>

      <h2>{u.searchHeading}</h2>
      <form action={searchPath(lang, city)} method="get">
        <input name="q" minLength={2} placeholder={u.searchPlaceholder} aria-label={u.searchHeading} />{" "}
        <button type="submit" className="btn">{u.searchButton}</button>
      </form>

      <h2>{u.stopsAz}</h2>
      <ul className="cities">
        {LETTER_KEYS.filter((k) => present.has(k)).map((k) => (
          <li key={k}><a className="city" href={letterPath(lang, city, k)}>{k.toUpperCase()}</a></li>
        ))}
      </ul>

      <h2>{u.cityLinesHeading}</h2>
      {groups.map((g) => (
        <section key={g.mode}>
          <h3>{t.groups.find((x) => x.mode === g.mode)?.heading}</h3>
          <ul className="linelist">
            {g.lines.map((l) => (
              <li key={l.id}>
                <a href={linePath(lang, city, l.id)}>{l.name}</a>
                <span className="muted"> {l.long_name}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <footer>
        <p className="muted">{u.scheduleNote}</p>
        <p className="muted">{s.disclaimer}</p>
      </footer>
    </main>
  );
}
