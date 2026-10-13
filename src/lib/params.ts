import { notFound } from "next/navigation";
import { CITIES, isEnabledLang, type City, type Lang } from "./config";

export function parseLangCity(p: { lang: string; city: string }): { lang: Lang; city: City } {
  if (!isEnabledLang(p.lang) || !(CITIES as readonly string[]).includes(p.city)) notFound();
  return { lang: p.lang, city: p.city as City };
}
