export const SITEMAP_MAX_URLS = 50000;

/** Splits a URL list into sitemap-sized chunks (Google allows 50,000 per file). */
export function chunk<T>(items: T[], size = SITEMAP_MAX_URLS): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out.length ? out : [[]];
}
