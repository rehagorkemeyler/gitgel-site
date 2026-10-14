import type { Lang } from "./config";
import { withSuffix } from "./turkish";

// The route snapshot behind the home page story (scripts/landing-route.mjs).
export type RideStop = { id: string; name: string; lat: number; lon: number; minute: number; meters: number };
export type RideRoute = {
  line: string;
  longName: string;
  firstLast: Partial<Record<"weekday" | "saturday" | "sunday", [string, string]>>;
  meters: number;
  stops: RideStop[];
  path: [number, number][];
};

export type RideDemo =
  | { kind: "live"; live: string; unit: string }
  | { kind: "route"; board: string; boardStop: string; alight: string; alightStop: string; ride: string }
  | { kind: "rail"; notice: string; train: string }
  | { kind: "track"; title: string; left: string; share: number };

export type RideStep = {
  stop: number; // index into route.stops the bus waits at during this step
  overview?: boolean;
  feature?: string;
  demo?: RideDemo;
  kicker: string;
  title: string;
  body: string;
};

export type LandingText = {
  steps: RideStep[];
  rail: number[]; // stop indexes listed on the side rail
  scrollHint: string;
  minutesLeft: string; // "{n}" is replaced with the minutes
  arrived: string;
  stopLabel: string;
  tripSummary: string;
  headline: [string, string];
  pitch: string;
  features: { title: string; body: string; tag?: string }[];
  sectionFeatures: string;
  sectionCities: string;
  stopsWord: string;
  linesWord: string;
  guides: string;
  guidesBody: string;
  closing: string;
  closingBody: string;
};

// Stop names in the data are sometimes "Altınpark 1.durak"; the story reads better with the place name.
const place = (name: string) => name.replace(/\s*\d+\.?\s*durak$/i, "").replace(/ Son Durak$/i, "");

const IDX = { start: 0, ulus: 13, kizilay: 16, kugulu: 19 };

export function landingText(lang: Lang, route: RideRoute): LandingText {
  const s = route.stops;
  const last = s.length - 1;
  const from = place(s[0].name);
  const to = s[last].name;
  const minutes = s[last].minute - s[0].minute;
  const at = (i: number) => s[Math.min(i, last)];
  const km = (route.meters / 1000).toLocaleString(lang === "tr" ? "tr-TR" : "en-GB", { maximumFractionDigits: 1 });
  const stopsLeftTo = (i: number) => last - Math.min(i, last);
  const rail = [0, 10, 13, 15, IDX.kizilay, 18, IDX.kugulu, 23, last].filter((i) => i <= last);
  const kiz = at(IDX.kizilay);
  const kug = at(IDX.kugulu);

  if (lang === "tr") {
    return {
      headline: ["Git. Gel.", "Gerisini GitGel bilir."],
      pitch:
        "Otobüsün nerede, metron kaç dakikada gelir, nerede ineceksin: İstanbul, Ankara ve Bursa'da hepsi tek uygulamada. Ücretsiz, reklamsız, üyeliksiz.",
      scrollHint: `Kaydır: ${route.line} ile ${withSuffix(from, "abl")} ${withSuffix(to, "dat")} gidelim`,
      steps: [
        { stop: 0, overview: true, kicker: "Ankara · İstanbul · Bursa", title: "", body: "" },
        {
          stop: IDX.start,
          feature: "Canlı otobüs",
          kicker: s[0].name,
          title: "Otobüsün nerede? Haritada gör.",
          body: "Otobüsler haritada canlı akar, durağına kaç dakika kaldığını anında görürsün. Ankara'da EGO, İstanbul'da İETT, Bursa'da BursaKart verisiyle.",
          demo: { kind: "live", live: "Durağa yaklaşan otobüsler", unit: "dk" },
        },
        {
          stop: IDX.ulus,
          feature: "Yol tarifi",
          kicker: at(IDX.ulus).name,
          title: "Nereye? Yazman yeter.",
          body: "GitGel otobüs, metro ve yürüme adımlarıyla rotanı çıkarır: nerede bineceğin, nerede ineceğin, kaç aktarma yapacağın.",
          demo: { kind: "route", board: "Bin", boardStop: s[0].name, alight: "İn", alightStop: kiz.name, ride: `${route.line} · ${kiz.minute - s[0].minute} dk` },
        },
        {
          stop: IDX.kizilay,
          feature: "Canlı metro takibi",
          kicker: kiz.name,
          title: "Metron kaç dakikada gelir?",
          body: "Metro, Ankaray, Marmaray: trenleri haritada canlı takip et, peronda beklemeden yetiş. Bir hatta aksama varsa önce sen görürsün.",
          demo: { kind: "rail", notice: "Ankaray · Kızılay yönü", train: "2 dk" },
        },
        {
          stop: IDX.kugulu,
          feature: "Yolculuk takibi",
          kicker: kug.name,
          title: "Telefonu cebine koy.",
          body: `GitGel durakları senin yerine sayar. ${withSuffix(to, "dat")} ${stopsLeftTo(IDX.kugulu)} durak kaldı; inme zamanı yaklaşınca "Sonraki durakta in" der.`,
          demo: { kind: "track", title: "İnme zamanı yaklaşıyor", left: `${withSuffix(to, "dat")} ${stopsLeftTo(IDX.kugulu)} durak`, share: IDX.kugulu / last },
        },
        {
          stop: last,
          kicker: to,
          title: "Vardın.",
          body: `${withSuffix(from, "abl")} ${withSuffix(to, "dat")} ${last} durak, ${km} km, ${minutes} dakika. Sıradaki yolculuğun GitGel'le olsun.`,
        },
      ],
      rail,
      minutesLeft: "{n} dk kaldı",
      arrived: "Vardın.",
      stopLabel: "Durak",
      tripSummary: `${route.line} · ${from} → ${to}`,
      sectionFeatures: "Yolculuğun tamamı, tek uygulamada",
      features: [
        { tag: "CANLI", title: "Canlı otobüs ve metro", body: "Araçlar haritada akar; durağına kaç dakika kaldığını tahmin etmezsin, görürsün." },
        { title: "Yol tarifi", body: "Nereden, nereye: otobüs, metro, vapur ve yürüme adımlarıyla, aktarmalarıyla birlikte." },
        { title: "Yolculuk takibi", body: "Binince takibi başlat; inme zamanı yaklaşınca GitGel uyarır. Takip yalnızca senin telefonunda çalışır." },
        { title: "Yakındakiler", body: "Konumunu aç, çevrendeki duraklar ve sıradaki kalkışlar gelsin. Konumun telefonundan çıkmaz." },
        { title: "Doluluk ve aksamalar", body: "Kartla binenlerden doluluk tahmini, hatlardaki aksamalar ve her durağın ilk ve son seferi." },
        { title: "Ücretsiz. Reklamsız. Üyeliksiz.", body: "Kurulum bile şart değil: tarayıcıda aç, kullan. İnternet giderse kayıtlı veriler gösterilir." },
      ],
      sectionCities: "Şehrini seç",
      stopsWord: "durak",
      linesWord: "hat",
      guides: "Rehberler",
      guidesBody: "Havalimanından şehre, kampüslere, vapurlara ve gece ulaşımına adım adım yol tarifleri.",
      closing: "Bir sonraki yolculuğun GitGel'le olsun.",
      closingBody: "Durağını aç, hattını seç, otobüsünü gör. Gerisini dert etme.",
    };
  }
  return {
    headline: ["Go. Get there.", "GitGel knows the rest."],
    pitch:
      "Where your bus is, when your metro comes, where to get off: Istanbul, Ankara and Bursa in one app. Free, no ads, no sign-up.",
    scrollHint: `Scroll: ride the ${route.line} from ${from} to ${to}`,
    steps: [
      { stop: 0, overview: true, kicker: "Ankara · Istanbul · Bursa", title: "", body: "" },
      {
        stop: IDX.start,
        feature: "Live buses",
        kicker: s[0].name,
        title: "Where's your bus? On the map.",
        body: "Buses move on the map live, and you see how many minutes until yours reaches your stop. EGO data in Ankara, İETT in Istanbul, BursaKart in Bursa.",
        demo: { kind: "live", live: "Buses approaching", unit: "min" },
      },
      {
        stop: IDX.ulus,
        feature: "Directions",
        kicker: at(IDX.ulus).name,
        title: "Where to? Just type it.",
        body: "GitGel plans your trip by bus, metro and on foot: where to board, where to get off and how many changes.",
        demo: { kind: "route", board: "Board", boardStop: s[0].name, alight: "Get off", alightStop: kiz.name, ride: `${route.line} · ${kiz.minute - s[0].minute} min` },
      },
      {
        stop: IDX.kizilay,
        feature: "Live metro tracking",
        kicker: kiz.name,
        title: "When does your metro come?",
        body: "Metro, Ankaray, Marmaray: track trains live on the map and catch yours without waiting on the platform. If a line is disrupted, you know first.",
        demo: { kind: "rail", notice: "Ankaray · to Kızılay", train: "2 min" },
      },
      {
        stop: IDX.kugulu,
        feature: "Trip tracking",
        kicker: kug.name,
        title: "Put your phone away.",
        body: `GitGel counts the stops for you. ${stopsLeftTo(IDX.kugulu)} stops to ${to}; when yours is next, it tells you "Get off at the next stop".`,
        demo: { kind: "track", title: "Your stop is next", left: `${stopsLeftTo(IDX.kugulu)} stops to ${to}`, share: IDX.kugulu / last },
      },
      {
        stop: last,
        kicker: to,
        title: "You're here.",
        body: `${from} to ${to}: ${last} stops, ${km} km, ${minutes} minutes. Make your next trip a GitGel trip.`,
      },
    ],
    rail,
    minutesLeft: "{n} min left",
    arrived: "You're here.",
    stopLabel: "Stop",
    tripSummary: `${route.line} · ${from} → ${to}`,
    sectionFeatures: "The whole trip, in one app",
    features: [
      { tag: "LIVE", title: "Live buses and metro", body: "Vehicles move on the map, so you see how long until yours arrives instead of guessing." },
      { title: "Directions", body: "From here to there by bus, metro, ferry and on foot, with every change spelled out." },
      { title: "Trip tracking", body: "Start tracking when you board; GitGel warns you when your stop is next. Tracking stays on your phone." },
      { title: "Nearby", body: "Turn on location to see the stops around you and the next departures. Your location never leaves your phone." },
      { title: "Crowding and disruptions", body: "Crowding estimates from card taps, disruptions on your lines, first and last trips at every stop." },
      { title: "Free. No ads. No sign-up.", body: "Nothing to install: open it in your browser. Offline, it shows your saved data." },
    ],
    sectionCities: "Choose your city",
    stopsWord: "stops",
    linesWord: "lines",
    guides: "Guides",
    guidesBody: "Step-by-step routes from the airports, to campuses, by ferry and at night.",
    closing: "Make your next trip a GitGel trip.",
    closingBody: "Open your stop, pick your line, see your bus. Leave the rest to us.",
  };
}
