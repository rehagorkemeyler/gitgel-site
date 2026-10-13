import type { MetadataRoute } from "next";
import { CITIES, ENABLED_LANGS, SITE_URL, type City, type Lang } from "@/lib/config";
import { getStops } from "@/lib/data";
import { stopSegment } from "@/lib/slug";
import { chunk } from "@/lib/sitemap-utils";

export const revalidate = 86400;

// One sitemap per language x city x type (stops now; lines arrive in W2).
// Each city has well under 50,000 stops, so every combination is one chunk.
export async function generateSitemaps() {
  return ENABLED_LANGS.flatMap((lang) => CITIES.map((city) => ({ id: `${lang}-${city}-stop` })));
}

export default async function sitemap(props: {
  id: Promise<string>;
}): Promise<MetadataRoute.Sitemap> {
  const id = await props.id;
  const [lang, city] = id.split("-") as [Lang, City];
  const stops = await getStops(city);
  const entries = stops.map((s) => {
    const seg = stopSegment(s.id, s.name);
    return {
      url: `${SITE_URL}/${lang}/${city}/stop/${seg}`,
      alternates: {
        languages: Object.fromEntries(
          ENABLED_LANGS.map((l) => [l, `${SITE_URL}/${l}/${city}/stop/${seg}`]),
        ),
      },
    };
  });
  return chunk(entries)[0];
}
