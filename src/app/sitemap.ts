import type { MetadataRoute } from "next";
import { CITIES, ENABLED_LANGS, SITE_URL, type City, type Lang } from "@/lib/config";
import { getLines, getStops } from "@/lib/data";
import { LETTER_KEYS, letterKey } from "@/lib/listing";
import { chunk, sitemapIds } from "@/lib/sitemap-utils";
import { GUIDES } from "@/content/guides";
import { cityPath, letterPath, linePath, stopPath } from "@/lib/urls";

export const revalidate = 86400;

type SitemapType = "stop" | "line" | "list";

// One sitemap per language x city x type. Each city has well under 50,000
// stops, so every combination is a single chunk.
export async function generateSitemaps() {
  return sitemapIds(ENABLED_LANGS, CITIES).map((id) => ({ id }));
}

type Entry = { path: (l: Lang) => string };

async function entriesFor(city: City, type: SitemapType): Promise<Entry[]> {
  if (type === "stop") {
    return (await getStops(city)).map((s) => ({ path: (l) => stopPath(l, city, s.id, s.name) }));
  }
  if (type === "line") {
    return [...(await getLines(city)).values()].map((x) => ({ path: (l) => linePath(l, city, x.id) }));
  }
  const present = new Set((await getStops(city)).map((s) => letterKey(s.name)));
  return [
    { path: (l) => cityPath(l, city) },
    ...LETTER_KEYS.filter((k) => present.has(k)).map((k) => ({ path: (l: Lang) => letterPath(l, city, k) })),
  ];
}

export default async function sitemap(props: {
  id: Promise<string>;
}): Promise<MetadataRoute.Sitemap> {
  const parts = (await props.id).split("-");
  const lang = parts[0] as Lang;
  const source: Entry[] =
    parts[1] === "guide"
      ? [{ path: (l: Lang) => `/${l}/guides` }, ...GUIDES.map((g) => ({ path: (l: Lang) => `/${l}/guides/${g.slug}` }))]
      : await entriesFor(parts[1] as City, parts[2] as SitemapType);
  const entries = source.map((e) => ({
    url: `${SITE_URL}${e.path(lang)}`,
    alternates: {
      languages: Object.fromEntries(ENABLED_LANGS.map((l) => [l, `${SITE_URL}${e.path(l)}`])),
    },
  }));
  return chunk(entries)[0];
}
