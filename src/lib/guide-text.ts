import type { Lang } from "./config";
import type { GuideStats } from "./guide-stats";
import { withSuffix } from "./turkish";

export type GuideUi = {
  guides: string; allGuides: string; guidesIntro: string; numbersHeading: string; stopsHeading: string;
  updated: string; line: string; direction: string; weekday: string; duration: string; min: string; stopsCount: string;
  home: string; moreGuides: string; scheduleNote: string; night: string;
  ctaKicker: string; ctaTitle: string; ctaBody: string; ctaBodyIndex: string; ctaPoints: string[]; ctaFree: string;
  stickyText: string; midCtaTitle: string; readGuide: string; guidesCount: string;
};

const tr: GuideUi = {
  guides: "Rehberler", allGuides: "Tüm rehberler",
  guidesIntro: "Havalimanı, kampüs, vapur ve metro gibi sık aranan yolculuklar için hat ve durak rehberleri. Saatler tarife verisinden alınır.",
  numbersHeading: "Hatlar ve saatler (veriden)", stopsHeading: "Bu rehberdeki duraklar",
  updated: "Güncelleme", line: "Hat", direction: "Yön", weekday: "Hafta içi ilk – son sefer", duration: "Süre", min: "dk",
  stopsCount: "durak", home: "Ana sayfa", moreGuides: "Diğer rehberler",
  scheduleNote: "Saatler tarifeye göredir, canlı konum değildir. İlk ve son sefer, hattın ilk durağından kalkışı gösterir.", night: "gece",
  ctaKicker: "GitGel uygulaması",
  ctaTitle: "Durağına gelen otobüsleri canlı takip et",
  ctaBody: "Bu sayfadaki saatler tarifeye göre. GitGel'de ise otobüsler ve metrolar haritada canlı akar, durağına kaç dakika kaldığını tahmin etmezsin, görürsün.",
  ctaBodyIndex: "Rehberlerdeki saatler tarifeye göre. GitGel'de ise otobüsler ve metrolar haritada canlı akar, durağına kaç dakika kaldığını tahmin etmezsin, görürsün.",
  ctaPoints: ["Canlı otobüs ve metro konumu", "Kapıdan kapıya yol tarifi", "Yolculuk takibi: ineceğin durağı kaçırma"],
  ctaFree: "Ücretsiz, reklamsız, kurulum gerekmez",
  stickyText: "Otobüsün nerede? Canlı gör",
  midCtaTitle: "Hattın şu an nerede olduğunu GitGel'de gör",
  readGuide: "Rehberi oku", guidesCount: "rehber",
};
const en: GuideUi = {
  guides: "Guides", allGuides: "All guides",
  guidesIntro: "Line and stop guides for common trips such as airports, campuses, ferries and metro. Times come from timetable data.",
  numbersHeading: "Lines and times (from the data)", stopsHeading: "Stops in this guide",
  updated: "Updated", line: "Line", direction: "Direction", weekday: "Weekday first – last service", duration: "Ride", min: "min",
  stopsCount: "stops", home: "Home", moreGuides: "More guides",
  scheduleNote: "Times follow the timetable; they are not live positions. First and last service show departures from the line's first stop.", night: "night",
  ctaKicker: "The GitGel app",
  ctaTitle: "Track the buses coming to your stop, live",
  ctaBody: "The times on this page follow the timetable. In GitGel, buses and trains move on the map live, so you see how many minutes until yours arrives instead of guessing.",
  ctaBodyIndex: "Times in the guides follow the timetable. In GitGel, buses and trains move on the map live, so you see how many minutes until yours arrives instead of guessing.",
  ctaPoints: ["Live bus and metro positions", "Door-to-door directions", "Trip tracking so you never miss your stop"],
  ctaFree: "Free, no ads, nothing to install",
  stickyText: "Where is your bus? See it live",
  midCtaTitle: "See where this line is right now in GitGel",
  readGuide: "Read the guide", guidesCount: "guides",
};
export const guideUi = (lang: Lang): GuideUi => (lang === "tr" ? tr : en);

export function formatDate(lang: Lang, iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString(lang === "tr" ? "tr-TR" : "en-GB", {
    day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
  });
}

/** One data-driven sentence summarising the listed lines. */
export function statsSentence(lang: Lang, s: GuideStats): string | null {
  if (s.lineCount === 0 || !s.earliestFirst || !s.latestLast) return null;
  if (lang === "tr") {
    const night = s.overnightLines > 0 ? ` ${s.overnightLines} hat ise tarifede gece saatlerine kadar sürüyor.` : "";
    return `Bu rehberdeki ${s.lineCount} hattın ilk seferi hafta içi en erken ${withSuffix(s.earliestFirst, "loc")}, son seferi en geç ${withSuffix(s.latestLast, "loc")}.${night}`;
  }
  const night = s.overnightLines > 0 ? ` ${s.overnightLines === 1 ? "One of them runs" : `${s.overnightLines} of them run`} into the night in the timetable.` : "";
  return `Across the ${s.lineCount} lines in this guide, weekday service starts as early as ${s.earliestFirst} and the last departure is as late as ${s.latestLast}.${night}`;
}
