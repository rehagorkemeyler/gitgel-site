import type { City, Lang } from "./config";
import type { LineMeta } from "./data";
import type { LineView } from "./line-view";
import { withSuffix } from "./turkish";

const MODE_TR: Record<string, [string, string]> = {
  bus: ["otobüs", "Otobüs hatları"], metro: ["metro", "Metro hatları"], metrobus: ["metrobüs", "Metrobüs hatları"],
  tram: ["tramvay", "Tramvay hatları"], rail: ["raylı sistem", "Raylı sistem hatları"], ferry: ["vapur", "Vapur hatları"],
  cablecar: ["teleferik", "Teleferik hatları"], funicular: ["füniküler", "Füniküler hatları"],
};
const MODE_EN: Record<string, [string, string]> = {
  bus: ["bus", "Bus lines"], metro: ["metro", "Metro lines"], metrobus: ["metrobus", "Metrobus lines"],
  tram: ["tram", "Tram lines"], rail: ["rail", "Rail lines"], ferry: ["ferry", "Ferry lines"],
  cablecar: ["cable car", "Cable car lines"], funicular: ["funicular", "Funicular lines"],
};
const CITY_TR: Record<City, string> = { istanbul: "İstanbul", ankara: "Ankara", bursa: "Bursa" };
const CITY_EN: Record<City, string> = { istanbul: "Istanbul", ankara: "Ankara", bursa: "Bursa" };

const nf = (lang: Lang) => (n: number) => n.toLocaleString(lang === "tr" ? "tr-TR" : "en-US");
const stripDot = (s: string) => s.replace(/\.+$/, "");
const clock = (t: string) => /^\d{1,2}:\d{2}$/.test(t);

export function modeNoun(lang: Lang, mode: string): string {
  return (lang === "tr" ? MODE_TR : MODE_EN)[mode]?.[0] ?? (lang === "tr" ? "toplu taşıma" : "public transport");
}
export function modeHeading(lang: Lang, mode: string): string {
  return (lang === "tr" ? MODE_TR : MODE_EN)[mode]?.[1] ?? (lang === "tr" ? "Diğer hatlar" : "Other lines");
}

export type Ui = {
  home: string; lines: string; stops: string; stopsAz: string; searchHeading: string; searchPlaceholder: string;
  searchButton: string; noResults: string; tooShort: string; times: string; weekday: string; saturday: string;
  sunday: string; night: string; stopList: string; minutesShort: string; scheduleNote: string; timesNote: string;
  appHeading: string; cityLinesHeading: string;
};

const uiTr: Ui = {
  home: "Ana sayfa", lines: "Hatlar", stops: "Duraklar", stopsAz: "Durakları harfe göre gez",
  searchHeading: "Durak ara", searchPlaceholder: "Durak adı (en az 2 harf)", searchButton: "Ara",
  noResults: "Eşleşen durak bulunamadı.", tooShort: "Aramak için en az 2 harf yaz.",
  times: "Sefer saatleri", weekday: "Hafta içi", saturday: "Cumartesi", sunday: "Pazar", night: "gece",
  stopList: "Duraklar (sırayla)", minutesShort: "dk", scheduleNote: "Saatler tarifeye göredir, canlı konum değildir.",
  timesNote: "Saatler hattın ilk durağından kalkışı gösterir; diğer duraklar için her durak sayfasında yaklaşık geçiş saati vardır.",
  appHeading: "GitGel'de canlı arama ve rota", cityLinesHeading: "Tüm hatlar",
};
const uiEn: Ui = {
  home: "Home", lines: "Lines", stops: "Stops", stopsAz: "Browse stops by letter",
  searchHeading: "Search stops", searchPlaceholder: "Stop name (at least 2 letters)", searchButton: "Search",
  noResults: "No matching stops found.", tooShort: "Type at least 2 letters to search.",
  times: "Service times", weekday: "Weekdays", saturday: "Saturday", sunday: "Sunday", night: "night",
  stopList: "Stops in order", minutesShort: "min", scheduleNote: "Times follow the timetable; they are not live positions.",
  timesNote: "Times are departures from the line's first stop; each stop page shows the approximate time at that stop.",
  appHeading: "Live search and routes in GitGel", cityLinesHeading: "All lines",
};
export const ui = (lang: Lang): Ui => (lang === "tr" ? uiTr : uiEn);

export function formatRange(lang: Lang, range: [string, string] | undefined): string | null {
  if (!range) return null;
  const [a, b] = range;
  const night = ui(lang).night;
  if (clock(a) && a === b) return lang === "tr" ? `tek sefer ${a}` : `single trip at ${a}`;
  return `${clock(a) ? a : night} – ${clock(b) ? b : night}`;
}

export type LineText = {
  title: string; description: string; h1: string; intro: string;
  directions: { heading: string; sentence: string; times: { label: string; value: string }[] }[];
};

export function lineText(lang: Lang, v: LineView, city: City): LineText {
  const { line } = v;
  const u = ui(lang);
  const mode = modeNoun(lang, line.mode);
  const n = nf(lang);
  const heads = [...new Set(v.directions.map((d) => d.headsign))];
  const first = v.directions[0];

  const tr = lang === "tr";
  const cityName = (tr ? CITY_TR : CITY_EN)[city];
  const inCity = tr ? withSuffix(cityName, "loc") : `in ${cityName}`;
  const h1 = tr ? `${line.name} ${mode} hattı` : `${line.name} ${mode} line`;
  const total = v.uniqueStops.length;

  let intro: string;
  if (tr) {
    intro =
      heads.length >= 2
        ? `${line.name} (${line.long_name}) ${inCity} ${heads.join(" ve ")} yönlerinde çalışan bir ${mode} hattıdır ve toplam ${n(total)} farklı durağa uğrar.`
        : `${line.name} (${line.long_name}) ${inCity} ${heads[0] ?? "tek"} yönünde çalışan bir ${mode} hattıdır ve ${n(total)} durağa uğrar.`;
  } else {
    intro =
      heads.length >= 2
        ? `${line.name} (${line.long_name}) is a ${mode} line ${inCity} running towards ${heads.join(" and ")}, serving ${n(total)} different stops.`
        : `${line.name} (${line.long_name}) is a ${mode} line ${inCity} towards ${heads[0] ?? "its terminus"}, serving ${n(total)} stops.`;
  }

  const directions = v.directions.map((d) => {
    const a = d.rows[0].stop.name;
    const b = d.rows[d.rows.length - 1].stop.name;
    const loop = a === b;
    const sentence = tr
      ? loop
        ? `Bu yön, ${a} durağında başlayıp yine orada biten ${n(d.rows.length)} duraklık bir halka güzergâhtır. Yolculuk tarifeye göre yaklaşık ${d.durationMinutes} dakika sürer.`
        : `Bu yönde ${n(d.rows.length)} durak vardır; ilk durak ${a}, son durak ${stripDot(b)}. Yolculuk tarifeye göre yaklaşık ${d.durationMinutes} dakika sürer.`
      : loop
        ? `This direction is a loop of ${n(d.rows.length)} stops that starts and ends at ${stripDot(a)}. The ride takes about ${d.durationMinutes} minutes according to the timetable.`
        : `This direction has ${n(d.rows.length)} stops, from ${a} to ${stripDot(b)}. The ride takes about ${d.durationMinutes} minutes according to the timetable.`;
    const times = (
      [["weekday", u.weekday], ["saturday", u.saturday], ["sunday", u.sunday]] as const
    ).flatMap(([key, label]) => {
      const value = formatRange(lang, d.times[key]);
      return value ? [{ label, value }] : [];
    });
    const dup = v.directions.filter((x) => x.headsign === d.headsign).length > 1;
    const num = v.directions.indexOf(d) + 1;
    const heading = tr
      ? `${dup ? `${num}. yön: ` : ""}${d.headsign} yönü`
      : `${dup ? `Direction ${num}: t` : "T"}owards ${d.headsign}`;
    return { heading, sentence, times };
  });

  const wk = first ? formatRange(lang, first.times.weekday) : null;
  return {
    title: tr
      ? `${line.name} ${mode} hattı (${line.long_name}) – durakları ve saatleri · GitGel`
      : `${line.name} ${mode} line (${line.long_name}) – stops and times · GitGel`,
    description: tr
      ? `${line.name} ${mode} hattı: ${n(total)} durak, ${heads.join(" / ")} yönleri${wk ? `, hafta içi ${wk}` : ""}. Tüm duraklar ve sefer saatleri.`
      : `${line.name} ${mode} line: ${n(total)} stops, towards ${heads.join(" / ")}${wk ? `, weekdays ${wk}` : ""}. All stops and service times.`,
    h1, intro, directions,
  };
}

export type CityText = { title: string; description: string; h1: string; intro: string; groups: { mode: string; heading: string }[] };

export function cityText(
  lang: Lang, city: City, lines: LineMeta[], stopCount: number,
): CityText {
  const tr = lang === "tr";
  const n = nf(lang);
  const cityName = (tr ? CITY_TR : CITY_EN)[city];
  const counts = new Map<string, number>();
  for (const l of lines) counts.set(l.mode, (counts.get(l.mode) ?? 0) + 1);
  const parts = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([m, c]) => `${n(c)} ${modeNoun(lang, m)}`);
  const list = parts.join(", ");
  return {
    title: tr
      ? `${cityName} toplu taşıma: ${n(lines.length)} hat ve ${n(stopCount)} durak · GitGel`
      : `${cityName} public transport: ${n(lines.length)} lines and ${n(stopCount)} stops · GitGel`,
    description: tr
      ? `${cityName} için tüm hatlar ve duraklar: ${list} hattı. Durak adına göre ara, hat saatlerine bak.`
      : `All lines and stops for ${cityName}: ${list} lines. Search by stop name and check timetables.`,
    h1: tr ? `${cityName} toplu taşıma hatları ve durakları` : `${cityName} public transport lines and stops`,
    intro: tr
      ? `${cityName} için ${n(lines.length)} hat (${list}) ve ${n(stopCount)} durak listeleniyor. Bir hatta tıklayarak duraklarını ve sefer saatlerini, bir durağa tıklayarak o duraktan geçen hatları görebilirsin.`
      : `${cityName} has ${n(lines.length)} lines (${list}) and ${n(stopCount)} stops listed. Open a line for its stops and service times, or a stop to see the lines that call there.`,
    groups: [...counts.keys()].map((mode) => ({ mode, heading: modeHeading(lang, mode) })),
  };
}

export function letterText(lang: Lang, city: City, letter: string, count: number) {
  const tr = lang === "tr";
  const cityName = (tr ? CITY_TR : CITY_EN)[city];
  const L = letter.toLocaleUpperCase(lang === "tr" ? "tr" : "en");
  return {
    title: tr
      ? `${cityName} durakları: ${L} ile başlayanlar (${nf(lang)(count)}) · GitGel`
      : `${cityName} stops starting with ${L} (${nf(lang)(count)}) · GitGel`,
    h1: tr ? `${cityName} durakları: ${L}` : `${cityName} stops: ${L}`,
    intro: tr
      ? `${withSuffix(cityName, "loc")} adı ${L} ile başlayan ${nf(lang)(count)} durak. Bir durağa tıklayarak geçen hatları ve ilk/son sefer saatlerini gör.`
      : `${nf(lang)(count)} stops in ${cityName} whose name starts with ${L}. Open a stop to see its lines and first and last service times.`,
  };
}

export function searchTitle(lang: Lang, city: City): string {
  const cityName = (lang === "tr" ? CITY_TR : CITY_EN)[city];
  return lang === "tr" ? `${cityName} durak ara · GitGel` : `Search ${cityName} stops · GitGel`;
}

export const cityName = (lang: Lang, city: City) => (lang === "tr" ? CITY_TR : CITY_EN)[city];
