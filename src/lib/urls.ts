import { ENABLED_LANGS, type City, type Lang } from "./config";
import { stopSegment } from "./slug";

export const cityPath = (lang: Lang, city: City) => `/${lang}/${city}`;
export const stopPath = (lang: Lang, city: City, id: string, name: string) =>
  `/${lang}/${city}/stop/${stopSegment(id, name)}`;
export const linePath = (lang: Lang, city: City, id: string) =>
  `/${lang}/${city}/line/${encodeURIComponent(id)}`;
export const letterPath = (lang: Lang, city: City, letter: string) =>
  `/${lang}/${city}/stops/${letter}`;
export const searchPath = (lang: Lang, city: City) => `/${lang}/${city}/search`;

/** Canonical + hreflang alternates for the enabled languages. */
export function alternatesFor(lang: Lang, build: (l: Lang) => string) {
  return {
    canonical: build(lang),
    languages: {
      ...Object.fromEntries(ENABLED_LANGS.map((l) => [l, build(l)])),
      "x-default": build("tr"),
    },
  };
}
