import { CITIES, ENABLED_LANGS, SITE_URL } from "@/lib/config";
import { sitemapIds, sitemapIndexXml } from "@/lib/sitemap-utils";

export const dynamic = "force-static";

export function GET() {
  return new Response(sitemapIndexXml(SITE_URL, sitemapIds(ENABLED_LANGS, CITIES)), {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
