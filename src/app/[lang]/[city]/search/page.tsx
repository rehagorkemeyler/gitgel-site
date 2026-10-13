import type { Metadata } from "next";
import { getLines, getStops } from "@/lib/data";
import { searchStops } from "@/lib/listing";
import { parseLangCity } from "@/lib/params";
import { searchTitle, ui } from "@/lib/pages-text";
import { getStrings } from "@/lib/strings";
import { cityPath, searchPath, stopPath } from "@/lib/urls";

type Props = {
  params: Promise<{ lang: string; city: string }>;
  searchParams: Promise<{ q?: string | string[] }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, city } = parseLangCity(await params);
  return { title: searchTitle(lang, city), robots: { index: false, follow: true } };
}

export default async function SearchPage({ params, searchParams }: Props) {
  const { lang, city } = parseLangCity(await params);
  const raw = (await searchParams).q;
  const q = (Array.isArray(raw) ? raw[0] : raw)?.trim().slice(0, 60) ?? "";
  const u = ui(lang);
  const s = getStrings(lang);
  const [stops, lineMeta] = await Promise.all([getStops(city), getLines(city)]);
  const results = searchStops(stops, q);

  return (
    <main>
      <nav className="muted">
        <a href={`/${lang}`}>{u.home}</a> › <a href={cityPath(lang, city)}>{s.cities[city]}</a> › {u.searchHeading}
      </nav>
      <h1>{u.searchHeading}</h1>
      <form action={searchPath(lang, city)} method="get">
        <input name="q" defaultValue={q} minLength={2} placeholder={u.searchPlaceholder} aria-label={u.searchHeading} />{" "}
        <button type="submit" className="btn">{u.searchButton}</button>
      </form>
      {q && q.length < 2 && <p>{u.tooShort}</p>}
      {q.length >= 2 && results.length === 0 && <p>{u.noResults}</p>}
      <ul className="linelist">
        {results.map((st) => (
          <li key={st.id}>
            <a href={stopPath(lang, city, st.id, st.name)}>{st.name}</a>
            <span className="muted"> {st.lines.slice(0, 4).map((id) => lineMeta.get(id)?.name ?? id).join(", ")}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}
