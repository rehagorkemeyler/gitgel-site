import type { MetadataRoute } from "next";
import { CITIES, ENABLED_LANGS, SITE_URL, type City, type Lang } from "@/lib/config";
import { getLines, getStops } from "@/lib/data";
import { LETTER_KEYS, letterKey } from "@/lib/listing";
import { chunk } from "@/lib/sitemap-utils";
import { cityPath, letterPath, linePath, stopPath } from "@/lib/urls";

export const revalidate = 86400;

const TYPES = ["stop", "line", "list"] as const;
type SitemapType = (typeof TYPES)[number];

// One sitemap per language x city x type. Each city has well under 50,000
// stops, so every combination is a single chunk.
export async function generateSitemaps() {
  return ENABLED_LANGS.flatMap((lang) =>
    CITIES.flatMap((city) => TYPES.map((type) => ({ id: `${lang}-${city}-${type}` }))),
  );
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
  const [lang, city, type] = (await props.id).split("-") as [Lang, City, SitemapType];
  const entries = (await entriesFor(city, type)).map((e) => ({
    url: `${SITE_URL}${e.path(lang)}`,
    alternates: {
      languages: Object.fromEntries(ENABLED_LANGS.map((l) => [l, `${SITE_URL}${e.path(l)}`])),
    },
  }));
  return chunk(entries)[0];
}
