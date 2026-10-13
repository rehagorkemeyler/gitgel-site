import type { MetadataRoute } from "next";
import { CITIES, ENABLED_LANGS, SITE_URL } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      { userAgent: ["GPTBot", "ClaudeBot", "PerplexityBot"], allow: "/" },
    ],
    sitemap: ENABLED_LANGS.flatMap((lang) =>
      CITIES.map((city) => `${SITE_URL}/sitemap/${lang}-${city}-stop.xml`),
    ),
  };
}
