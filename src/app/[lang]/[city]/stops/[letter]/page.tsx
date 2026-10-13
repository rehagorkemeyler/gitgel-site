import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLines, getStops } from "@/lib/data";
import { LETTER_KEYS, stopsForLetter } from "@/lib/listing";
import { parseLangCity } from "@/lib/params";
import { letterText, ui } from "@/lib/pages-text";
import { getStrings } from "@/lib/strings";
import { alternatesFor, cityPath, letterPath, stopPath } from "@/lib/urls";

export const revalidate = 86400;
export function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ lang: string; city: string; letter: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await params;
  const { lang, city } = parseLangCity(p);
  if (!LETTER_KEYS.includes(p.letter)) return {};
  const count = stopsForLetter(await getStops(city), p.letter).length;
  const t = letterText(lang, city, p.letter, count);
  return { title: t.title, description: t.intro, alternates: alternatesFor(lang, (l) => letterPath(l, city, p.letter)) };
}

export default async function LetterPage({ params }: Props) {
  const p = await params;
  const { lang, city } = parseLangCity(p);
  if (!LETTER_KEYS.includes(p.letter)) notFound();
  const [stops, lineMeta] = await Promise.all([getStops(city), getLines(city)]);
  const list = stopsForLetter(stops, p.letter);
  if (list.length === 0) notFound();
  const t = letterText(lang, city, p.letter, list.length);
  const u = ui(lang);
  const s = getStrings(lang);

  return (
    <main>
      <nav className="muted">
        <a href={`/${lang}`}>{u.home}</a> › <a href={cityPath(lang, city)}>{s.cities[city]}</a> › {p.letter.toUpperCase()}
      </nav>
      <h1>{t.h1}</h1>
      <p>{t.intro}</p>
      <ul className="linelist">
        {list.map((st) => (
          <li key={st.id}>
            <a href={stopPath(lang, city, st.id, st.name)}>{st.name}</a>
            <span className="muted"> {st.lines.slice(0, 4).map((id) => lineMeta.get(id)?.name ?? id).join(", ")}</span>
          </li>
        ))}
      </ul>
      <footer><p className="muted">{s.disclaimer}</p></footer>
    </main>
  );
}
