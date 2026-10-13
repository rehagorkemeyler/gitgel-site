export const SITEMAP_MAX_URLS = 50000;

/** Splits a URL list into sitemap-sized chunks (Google allows 50,000 per file). */
export function chunk<T>(items: T[], size = SITEMAP_MAX_URLS): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out.length ? out : [[]];
}

export const SITEMAP_TYPES = ["stop", "line", "list"] as const;

/** Ids of every sitemap file: `<lang>-guide` plus `<lang>-<city>-<type>`. */
export function sitemapIds(langs: readonly string[], cities: readonly string[]): string[] {
  return langs.flatMap((lang) => [
    `${lang}-guide`,
    ...cities.flatMap((city) => SITEMAP_TYPES.map((type) => `${lang}-${city}-${type}`)),
  ]);
}

export function sitemapIndexXml(siteUrl: string, ids: string[]): string {
  const items = ids.map((id) => `<sitemap><loc>${siteUrl}/sitemap/${id}.xml</loc></sitemap>`).join("");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${items}</sitemapindex>`;
}
