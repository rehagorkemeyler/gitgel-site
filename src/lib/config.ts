export const APP_WEB_URL = "https://rehagorkemeyler.github.io/GitGel/";
// TODO(W5): replace with the Play Store link once published.
export const APP_ANDROID_URL = "https://github.com/rehagorkemeyler/gitgel-native/releases/latest";

export const ALL_LANGS = ["tr", "en", "ru", "de", "ar", "fa"] as const;
export type Lang = (typeof ALL_LANGS)[number];

// The one switch for the phased rollout: sitemap and hreflang list only these.
export const ENABLED_LANGS: readonly Lang[] = ["tr", "en"];
export const DEFAULT_LANG: Lang = "tr";

export const RTL_LANGS: readonly Lang[] = ["ar", "fa"];

export const CITIES = ["istanbul", "ankara", "bursa"] as const;
export type City = (typeof CITIES)[number];

export function isEnabledLang(value: string): value is Lang {
  return (ENABLED_LANGS as readonly string[]).includes(value);
}

export function dirOf(lang: Lang): "rtl" | "ltr" {
  return RTL_LANGS.includes(lang) ? "rtl" : "ltr";
}

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gitgel-site.vercel.app";
