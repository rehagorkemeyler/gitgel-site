import type { City } from "@/lib/config";
import type { GuideCopy, GuideDef } from "./guides";

export const UPDATED = "2026-10-13";

/** Compact copy builder: sections are [heading, paragraph] pairs. */
export function c(
  title: string,
  description: string,
  intro: string,
  sections: [string, string][],
): GuideCopy {
  return { title, description, intro, sections: sections.map(([heading, p]) => ({ heading, paragraphs: [p] })) };
}

export function d(
  slug: string,
  city: City,
  lines: string[],
  stops: string[],
  tr: GuideCopy,
  en: GuideCopy,
): GuideDef {
  return { slug, city, lines, stops, updated: UPDATED, tr, en };
}
