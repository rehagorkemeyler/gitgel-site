import type { City, Lang } from "./config";

export type Strings = {
  siteName: string;
  title: string;
  description: string;
  pitch: string;
  useWeb: string;
  androidDownload: string;
  chooseCity: string;
  cities: Record<City, string>;
  scheduleNote: string;
  disclaimer: string;
};

const tr: Strings = {
  siteName: "GitGel",
  title: "GitGel – İstanbul, Ankara ve Bursa için ücretsiz toplu taşıma uygulaması",
  description:
    "Otobüs, metro, vapur ve tramvay duraklarını, hatları ve saatleri GitGel ile bul. Ücretsiz, reklamsız, kurulum gerektirmez.",
  pitch: "İstanbul, Ankara ve Bursa'da durakları, hatları ve tarife saatlerini tek yerden bul.",
  useWeb: "Web'de kullan",
  androidDownload: "Android'e indir",
  chooseCity: "Şehrini seç",
  cities: { istanbul: "İstanbul", ankara: "Ankara", bursa: "Bursa" },
  scheduleNote: "Saatler tarifeye göredir, canlı konum değildir.",
  disclaimer:
    "GitGel bağımsız bir uygulamadır; İETT, EGO, Metro İstanbul veya BURULAŞ ile bağlantısı yoktur.",
};

const en: Strings = {
  siteName: "GitGel",
  title: "GitGel – free public transport app for Istanbul, Ankara and Bursa",
  description:
    "Find bus, metro, ferry and tram stops, lines and timetables with GitGel. Free, no ads, nothing to install.",
  pitch: "Find stops, lines and timetables in Istanbul, Ankara and Bursa in one place.",
  useWeb: "Use on the web",
  androidDownload: "Download for Android",
  chooseCity: "Choose your city",
  cities: { istanbul: "Istanbul", ankara: "Ankara", bursa: "Bursa" },
  scheduleNote: "Times follow the timetable; they are not live positions.",
  disclaimer:
    "GitGel is independent and not affiliated with İETT, EGO, Metro İstanbul or BURULAŞ.",
};

// ru, de, ar, fa arrive in Stage W6; until then they fall back to en so the
// routing and rtl support can be built and tested now.
const dictionaries: Record<Lang, Strings> = { tr, en, ru: en, de: en, ar: en, fa: en };

export function getStrings(lang: Lang): Strings {
  return dictionaries[lang];
}
