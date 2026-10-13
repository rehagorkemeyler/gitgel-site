import type { Lang } from "./config";
import type { GuideStats } from "./guide-stats";
import { withSuffix } from "./turkish";

export type GuideUi = {
  guides: string; allGuides: string; guidesIntro: string; numbersHeading: string; stopsHeading: string;
  updated: string; line: string; direction: string; weekday: string; duration: string; min: string; stopsCount: string;
  home: string; moreGuides: string; scheduleNote: string; night: string;
};

const tr: GuideUi = {
  guides: "Rehberler", allGuides: "Tüm rehberler",
  guidesIntro: "Havalimanı, kampüs, vapur ve metro gibi sık aranan yolculuklar için hat ve durak rehberleri. Saatler tarife verisinden alınır.",
  numbersHeading: "Hatlar ve saatler (veriden)", stopsHeading: "Bu rehberdeki duraklar",
  updated: "Güncelleme", line: "Hat", direction: "Yön", weekday: "Hafta içi ilk – son sefer", duration: "Süre", min: "dk",
  stopsCount: "durak", home: "Ana sayfa", moreGuides: "Diğer rehberler",
  scheduleNote: "Saatler tarifeye göredir, canlı konum değildir. İlk ve son sefer, hattın ilk durağından kalkışı gösterir.", night: "gece",
};
const en: GuideUi = {
  guides: "Guides", allGuides: "All guides",
  guidesIntro: "Line and stop guides for common trips such as airports, campuses, ferries and metro. Times come from timetable data.",
  numbersHeading: "Lines and times (from the data)", stopsHeading: "Stops in this guide",
  updated: "Updated", line: "Line", direction: "Direction", weekday: "Weekday first – last service", duration: "Ride", min: "min",
  stopsCount: "stops", home: "Home", moreGuides: "More guides",
  scheduleNote: "Times follow the timetable; they are not live positions. First and last service show departures from the line's first stop.", night: "night",
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
