import type { City, Lang } from "./config";
import { withSuffix } from "./turkish";
import { roundMeters, type StopView } from "./stop-view";

export type StopText = {
  title: string;
  description: string;
  h1: string;
  intro: string;
  linesHeading: string;
  lineSentences: { lineId: string; heading: string; sentences: string[] }[];
  scheduleNote: string;
  oppositeSentence: string | null;
  nearbyHeading: string;
  nearbyItems: { stopId: string; label: string; detail: string }[];
  appHeading: string;
  home: string;
};

const MODE_TR: Record<string, string> = {
  bus: "otobüs", metro: "metro", metrobus: "metrobüs", tram: "tramvay", rail: "raylı sistem",
  ferry: "vapur", cablecar: "teleferik", funicular: "füniküler",
};
const MODE_EN: Record<string, string> = {
  bus: "bus", metro: "metro", metrobus: "metrobus", tram: "tram", rail: "rail",
  ferry: "ferry", cablecar: "cable car", funicular: "funicular",
};
type Place = { nom: string; abl: string; bareAbl: string };
const DURAK: Place = { nom: "durağı", abl: "durağından", bareAbl: "duraktan" };
const ISTASYON: Place = { nom: "istasyonu", abl: "istasyonundan", bareAbl: "istasyondan" };
const ISKELE: Place = { nom: "iskelesi", abl: "iskelesinden", bareAbl: "iskeleden" };
const PLACE_TR: Record<string, Place> = {
  bus: DURAK, metrobus: DURAK, tram: DURAK, metro: ISTASYON, rail: ISTASYON,
  ferry: ISKELE, cablecar: ISTASYON, funicular: ISTASYON,
};
const CITY_TR: Record<City, string> = { istanbul: "İstanbul", ankara: "Ankara", bursa: "Bursa" };

const join = (items: string[]) => items.join(", ");
const clock = (t: string) => /^\d{1,2}:\d{2}$/.test(t);

function trText(v: StopView, code: string, city: City): StopText {
  const { stop } = v;
  const place = PLACE_TR[stop.mode] ?? DURAK;
  const mode = MODE_TR[stop.mode] ?? "toplu taşıma";
  const names = v.lines.map((l) => l.name);
  const h1 = `${stop.name} ${place.nom}`;
  const inCity = withSuffix(CITY_TR[city], "loc");
  const count = names.length;
  const lineWord = `${count} hat`;
  const listed = join(names.slice(0, 8)) + (count > 8 ? " ve diğerleri" : "");

  const lineSentences = v.lines.map((l) => {
    const sentences: string[] = [];
    if (l.departures.length === 0) {
      sentences.push(`${l.name} hattı (${l.longName}) bu ${place.bareAbl} geçer.`);
    }
    for (const d of l.departures) {
      if (clock(d.first) && d.first === d.last) {
        sentences.push(`${d.headsign} yönünde hafta içi tek sefer yaklaşık ${withSuffix(d.first, "loc")} bu ${place.bareAbl} geçer.`);
      } else if (clock(d.first) && clock(d.last)) {
        sentences.push(
          `${d.headsign} yönünde hafta içi ilk sefer yaklaşık ${withSuffix(d.first, "loc")}, son sefer ${withSuffix(d.last, "loc")} bu ${place.bareAbl} geçer.`,
        );
      } else if (clock(d.first)) {
        sentences.push(`${d.headsign} yönünde hafta içi ilk sefer yaklaşık ${withSuffix(d.first, "loc")} geçer, son sefer gece saatlerine kadar sürer.`);
      }
    }
    return { lineId: l.id, heading: `${l.name} – ${l.longName}`, sentences };
  });

  const opposite = v.opposite
    ? `Karşı yönün durağı ${roundMeters(v.opposite.meters)} m ötede: ${v.opposite.stop.name}${v.opposite.lineNames.length ? ` (${join(v.opposite.lineNames.slice(0, 4))})` : ""}.`
    : null;

  return {
    title: `${stop.name} ${place.nom} (${code}) – ${join(names.slice(0, 3))} ${mode} saatleri · GitGel`,
    description: `${h1}: ${join(names.slice(0, 6))} hatlarının ilk ve son sefer saatleri, karşı yön durağı ve yakındaki duraklar.`,
    h1,
    intro: `${inCity} ${stop.name} ${place.abl} ${lineWord} geçer: ${listed}.`,
    linesHeading: "Bu duraktan geçen hatlar",
    lineSentences,
    scheduleNote: "Saatler tarifeye göredir, canlı konum değildir.",
    oppositeSentence: opposite,
    nearbyHeading: "Yakındaki duraklar",
    nearbyItems: v.nearby.map((n) => ({
      stopId: n.stop.id,
      label: n.stop.name,
      detail: `${roundMeters(n.meters)} m · ${join(n.lineNames.slice(0, 4))}`,
    })),
    appHeading: "GitGel'de canlı arama ve rota",
    home: "Ana sayfa",
  };
}

function enText(v: StopView, code: string, city: City): StopText {
  const { stop } = v;
  const mode = MODE_EN[stop.mode] ?? "public transport";
  const names = v.lines.map((l) => l.name);
  const count = names.length;
  const h1 = `${stop.name} ${stop.mode === "ferry" ? "pier" : stop.mode === "bus" ? "bus stop" : "station"}`;
  const cityName = city === "istanbul" ? "Istanbul" : city === "ankara" ? "Ankara" : "Bursa";

  const lineSentences = v.lines.map((l) => ({
    lineId: l.id,
    heading: `${l.name} – ${l.longName}`,
    sentences:
      l.departures.length === 0
        ? [`Line ${l.name} (${l.longName}) serves this stop.`]
        : l.departures.map((d) =>
            clock(d.first) && d.first === d.last
              ? `Towards ${d.headsign}, a single weekday service reaches this stop around ${d.first}.`
              : clock(d.first) && clock(d.last)
              ? `Towards ${d.headsign}, on weekdays the first service reaches this stop around ${d.first} and the last around ${d.last}.`
              : `Towards ${d.headsign}, on weekdays the first service reaches this stop around ${d.first}.`,
          ),
  }));

  return {
    title: `${stop.name} (${code}) – ${join(names.slice(0, 3))} ${mode} times · GitGel`,
    description: `${h1} in ${cityName}: ${count} ${count === 1 ? "line" : "lines"} (${join(names.slice(0, 6))}), first and last service times and nearby stops.`,
    h1,
    intro: `${stop.name} is a ${mode === "bus" ? "bus stop" : stop.mode === "ferry" ? "ferry pier" : `${mode} station`} in ${cityName}, served by ${count} ${count === 1 ? "line" : "lines"}: ${join(names.slice(0, 8))}${count > 8 ? " and more" : ""}.`,
    linesHeading: "Lines at this stop",
    lineSentences,
    scheduleNote: "Times follow the timetable; they are not live positions.",
    oppositeSentence: v.opposite
      ? `The stop for the opposite direction is ${roundMeters(v.opposite.meters)} m away: ${v.opposite.stop.name}${v.opposite.lineNames.length ? ` (${join(v.opposite.lineNames.slice(0, 4))})` : ""}.`
      : null,
    nearbyHeading: "Nearby stops",
    nearbyItems: v.nearby.map((n) => ({
      stopId: n.stop.id,
      label: n.stop.name,
      detail: `${roundMeters(n.meters)} m · ${join(n.lineNames.slice(0, 4))}`,
    })),
    appHeading: "Live search and routes in GitGel",
    home: "Home",
  };
}

export function stopText(lang: Lang, v: StopView, code: string, city: City): StopText {
  return lang === "tr" ? trText(v, code, city) : enText(v, code, city);
}
