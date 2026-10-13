const MAP: Record<string, string> = {
  ç: "c", ğ: "g", ı: "i", i: "i", ö: "o", ş: "s", ü: "u", â: "a", î: "i", û: "u",
};

export function slugify(text: string): string {
  const lowered = text.replace(/İ/g, "i").replace(/I/g, "ı").toLocaleLowerCase("tr");
  const ascii = [...lowered].map((c) => MAP[c] ?? c).join("");
  return ascii
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/, "");
}

/** Path segment `<code>-<slug>`; codes never contain a dash. */
export function stopSegment(code: string, name: string): string {
  const slug = slugify(name);
  return slug ? `${code}-${slug}` : code;
}

export function parseStopSegment(segment: string): { code: string; slug: string } {
  const i = segment.indexOf("-");
  return i === -1
    ? { code: segment, slug: "" }
    : { code: segment.slice(0, i), slug: segment.slice(i + 1) };
}
