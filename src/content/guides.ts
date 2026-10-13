import type { City, Lang } from "@/lib/config";
import { ANKARA_GUIDES } from "./guides-ankara";
import { BURSA_GUIDES } from "./guides-bursa";
import { ISTANBUL_GUIDES } from "./guides-istanbul";

export type GuideCopy = {
  title: string;
  description: string;
  intro: string;
  sections: { heading: string; paragraphs: string[] }[];
};

export type GuideDef = {
  slug: string;
  city: City;
  /** Line ids shown in the numbers table. Empty: derived from the listed stops. */
  lines: string[];
  /** Stop ids linked from the guide. */
  stops: string[];
  updated: string;
  tr: GuideCopy;
  en: GuideCopy;
};

const UPDATED = "2026-10-13";


const BASE_GUIDES: GuideDef[] = [
  {
    slug: "istanbul-havalimani-sehir-merkezi",
    city: "istanbul",
    lines: ["m11", "h-1", "h-2", "h-3", "h-6", "h-8"],
    stops: ["5249978", "5251000", "579887", "mi_75"],
    updated: UPDATED,
    tr: {
      title: "İstanbul Havalimanı (IST) ile şehir arası: metro ve otobüs hatları",
      description: "IST'den şehre M11 metro ve H serisi otobüsler: hat adları, ilk ve son sefer saatleri, süreler ve durakları.",
      intro: "İstanbul Havalimanı (IST), şehrin kuzeybatısında, Avrupa yakasında yer alır. Şehre M11 metro hattı ve İETT'nin H harfli otobüsleri gider. Aşağıdaki saatler ve süreler GitGel'in kullandığı tarife verisinden alınmıştır.",
      sections: [
        { heading: "Hangi hattı seçmeli?", paragraphs: [
          "M11 metro hattı Gayrettepe, İstanbul Havalimanı ve Halkalı arasında çalışır. Gayrettepe'de M2 hattına aktarma yapabilirsin; Taksim de M2 üzerindedir.",
          "H serisi otobüsler havalimanı garajından Mahmutbey, Mecidiyeköy Metrobüs, Gümrük, Yunus Emre Mahallesi ve Hacıosman gibi noktalara gider. Bulunduğun semte en yakın çıkışı olan hattı seç.",
        ] },
        { heading: "Taksim, Sultanahmet ve Anadolu yakası", paragraphs: [
          "Taksim'e M2 ile, Sultanahmet'e T1 tramvay ile ulaşılır; ikisi için de bir aktarma gerekir. Anadolu yakasına geçmek için Marmaray veya vapur kullanılır.",
          "Aktarmayı ve bineceğin durağı GitGel'de hat veya durak adıyla arayarak planlayabilirsin.",
        ] },
      ],
    },
    en: {
      title: "Istanbul Airport (IST) to the city: metro and bus lines",
      description: "From IST to the city by the M11 metro and H-series buses: line names, first and last service, ride times and stops.",
      intro: "Istanbul Airport (IST) lies north-west of the city on the European side. The M11 metro line and İETT's H-series buses connect it to the city. The times and durations below come from the timetable data GitGel uses.",
      sections: [
        { heading: "Which line to pick", paragraphs: [
          "The M11 metro runs between Gayrettepe, Istanbul Airport and Halkalı. At Gayrettepe you can change to the M2 line, and Taksim is on M2.",
          "The H-series buses run from the airport garage to points such as Mahmutbey, Mecidiyeköy Metrobüs, Gümrük, Yunus Emre Mahallesi and Hacıosman. Pick the line whose end point is closest to where you are going.",
        ] },
        { heading: "Taksim, Sultanahmet and the Asian side", paragraphs: [
          "Taksim is reached by M2 and Sultanahmet by the T1 tram; both need one change. To cross to the Asian side use Marmaray or a ferry.",
          "You can plan the change and your stop in GitGel by searching the line or stop name.",
        ] },
      ],
    },
  },
  {
    slug: "sabiha-gokcen-havalimani-sehir-merkezi",
    city: "istanbul",
    lines: ["m4", "e-10", "sg-1", "122h", "e-3", "16s", "mr60"],
    stops: ["897"],
    updated: UPDATED,
    tr: {
      title: "Sabiha Gökçen Havalimanı (SAW) ile şehir arası: metro ve otobüs hatları",
      description: "SAW'dan Kadıköy ve çevresine M4 metro ve otobüs hatları: ilk ve son sefer saatleri, süreler ve duraklar.",
      intro: "Sabiha Gökçen Havalimanı (SAW) Anadolu yakasında, Pendik'tedir. Kadıköy'e M4 metro hattı ve çeşitli otobüsler gider; saatler GitGel'in tarife verisinden alınmıştır.",
      sections: [
        { heading: "Kadıköy ve Anadolu yakası", paragraphs: [
          "M4 metro hattı Kadıköy ile Sabiha Gökçen Havalimanı arasında çalışır. E-10 ve SG-1 otobüsleri de Kadıköy ile havalimanını bağlar.",
          "4. Levent Metro ve Harem gibi başka noktalara 122H, E-3 ve 16S otobüsleri gider; Pendik için MR60 ve 132H vardır.",
        ] },
        { heading: "Avrupa yakasına geçmek", paragraphs: [
          "Avrupa yakasına gidecekse Kadıköy'den vapur ya da Marmaray ile geçebilirsin. Vapur ve Marmaray hatlarının sayfaları GitGel'de ayrı ayrı bulunur.",
        ] },
      ],
    },
    en: {
      title: "Sabiha Gökçen Airport (SAW) to the city: metro and bus lines",
      description: "From SAW to Kadıköy and beyond by the M4 metro and buses: first and last service, ride times and stops.",
      intro: "Sabiha Gökçen Airport (SAW) is on the Asian side, in Pendik. The M4 metro line and several buses connect it to Kadıköy; the times come from the timetable data GitGel uses.",
      sections: [
        { heading: "Kadıköy and the Asian side", paragraphs: [
          "The M4 metro runs between Kadıköy and Sabiha Gökçen Airport. The E-10 and SG-1 buses also link Kadıköy with the airport.",
          "Buses 122H, E-3 and 16S reach other points such as 4. Levent Metro and Harem; MR60 and 132H serve Pendik.",
        ] },
        { heading: "Getting to the European side", paragraphs: [
          "To reach the European side, cross from Kadıköy by ferry or by Marmaray. Both have their own pages in GitGel.",
        ] },
      ],
    },
  },
  {
    slug: "marmaray",
    city: "istanbul",
    lines: ["marmaray"],
    stops: ["681528", "510803", "5250052"],
    updated: UPDATED,
    tr: {
      title: "Marmaray: durakları, sefer saatleri ve aktarma noktaları",
      description: "Halkalı–Gebze Marmaray hattı: ilk ve son sefer, yolculuk süresi, Üsküdar ve Ayrılık Çeşmesi gibi duraklar.",
      intro: "Marmaray, Halkalı ile Gebze arasında çalışan banliyö hattıdır ve Boğaz'ın altından geçerek iki yakayı bağlar. Aşağıdaki saat ve süreler tarife verisinden gelir.",
      sections: [
        { heading: "Nerede aktarma yapılır?", paragraphs: [
          "Üsküdar ve Ayrılık Çeşmesi Anadolu yakasındaki önemli aktarma noktalarıdır; Ayrılık Çeşmesi'nden M4 metro ile Kadıköy'e geçilebilir. Halkalı ise M11 havalimanı metrosunun da durağıdır.",
        ] },
        { heading: "Marmaray'ı ne zaman seçmeli?", paragraphs: [
          "Vapur trafiğine ve deniz durumuna bağlı kalmadan iki yaka arasında geçmek istediğinde Marmaray iyi bir seçenektir. Vapur için Kadıköy–Eminönü rehberine de bak.",
        ] },
      ],
    },
    en: {
      title: "Marmaray: stops, service times and interchanges",
      description: "The Halkalı–Gebze Marmaray line: first and last service, ride time and stops such as Üsküdar and Ayrılık Çeşmesi.",
      intro: "Marmaray is the suburban line between Halkalı and Gebze that crosses under the Bosphorus and joins the two continents. The times and durations below come from the timetable data.",
      sections: [
        { heading: "Where to change", paragraphs: [
          "Üsküdar and Ayrılık Çeşmesi are the main interchanges on the Asian side; from Ayrılık Çeşmesi the M4 metro reaches Kadıköy. Halkalı is also a stop of the M11 airport metro.",
        ] },
        { heading: "When to choose Marmaray", paragraphs: [
          "Marmaray is a good choice when you want to cross between the two sides without depending on ferry schedules or sea conditions. For the ferry option see the Kadıköy–Eminönü guide.",
        ] },
      ],
    },
  },
  {
    slug: "metrobus",
    city: "istanbul",
    lines: ["34", "34a", "34as", "34b", "34bz", "34c", "34g", "34z"],
    stops: ["510950", "659096", "510762"],
    updated: UPDATED,
    tr: {
      title: "Metrobüs hatları: 34 serisi durakları ve sefer saatleri",
      description: "İstanbul metrobüs hatları 34, 34A, 34AS, 34B, 34BZ, 34C, 34G ve 34Z: ilk ve son sefer, yolculuk süreleri ve duraklar.",
      intro: "İstanbul'da metrobüs, 34 numaralı hat ailesiyle çalışır. Aşağıda her hattın yönleri, ilk ve son sefer saatleri ve yolculuk süreleri GitGel'in tarife verisinden listelenir.",
      sections: [
        { heading: "Hatlar arasındaki fark", paragraphs: [
          "34 ile başlayan hatların hepsi aynı güzergâhı paylaşmaz; harf eki hattın başlangıç veya bitiş durağını değiştirir. Hangi hattın senin durağına uğradığını durak sayfasında görebilirsin.",
        ] },
        { heading: "Önemli duraklar", paragraphs: [
          "Zincirlikuyu, Uzunçayır ve Kadıköy tarafındaki duraklar metrobüsün sık kullanılan aktarma noktalarıdır.",
        ] },
      ],
    },
    en: {
      title: "Metrobus lines: the 34 family, stops and service times",
      description: "Istanbul metrobus lines 34, 34A, 34AS, 34B, 34BZ, 34C, 34G and 34Z: first and last service, ride times and stops.",
      intro: "In Istanbul the metrobus runs as the family of lines numbered 34. Below, each line's directions, first and last service and ride times are listed from the timetable data GitGel uses.",
      sections: [
        { heading: "How the lines differ", paragraphs: [
          "Not every line starting with 34 follows the same route; the letter suffix changes where the line starts or ends. A stop's page shows which of them call there.",
        ] },
        { heading: "Key stops", paragraphs: [
          "Zincirlikuyu, Uzunçayır and the stops on the Kadıköy side are frequently used interchanges on the metrobus.",
        ] },
      ],
    },
  },
  {
    slug: "kadikoy-eminonu-karakoy-vapur",
    city: "istanbul",
    lines: ["sehir_hatlari-kdk-emn", "sehir_hatlari-krk-kdk", "turyol-emn-kdk", "turyol-k-koy-kdk", "sehir_hatlari-kdk-krk-emn"],
    stops: ["fer_18936", "fer_18920", "fer_94972", "fer_94969"],
    updated: UPDATED,
    tr: {
      title: "Kadıköy–Eminönü ve Kadıköy–Karaköy vapurları: saatler ve iskeleler",
      description: "Kadıköy ile Eminönü ve Karaköy arasındaki vapur hatları: ilk ve son sefer saatleri, sefer süreleri ve iskeleler.",
      intro: "Kadıköy, Eminönü ve Karaköy arasında hem Şehir Hatları hem Turyol vapurları çalışır. Aşağıdaki liste her hattın ilk ve son seferini ve süresini tarife verisinden gösterir.",
      sections: [
        { heading: "Hangi iskele hangisi?", paragraphs: [
          "Aynı şehirde birden fazla işletmenin iskelesi vardır: örneğin Kadıköy'de Şehir Hatları ve Turyol iskeleleri ayrı duraklar olarak görünür. Bineceğin hattın sayfasından hangi iskeleden kalktığını kontrol et.",
        ] },
        { heading: "Seferler hakkında", paragraphs: [
          "Vapur saatleri mevsime ve hava durumuna göre değişebilir. GitGel tarife saatlerini gösterir; canlı konum değildir.",
        ] },
      ],
    },
    en: {
      title: "Kadıköy–Eminönü and Kadıköy–Karaköy ferries: times and piers",
      description: "Ferry lines between Kadıköy and Eminönü or Karaköy: first and last service, crossing times and piers.",
      intro: "Both Şehir Hatları and Turyol ferries run between Kadıköy, Eminönü and Karaköy. The list below shows each line's first and last service and duration from the timetable data.",
      sections: [
        { heading: "Which pier is which", paragraphs: [
          "Several operators have their own piers in the same neighbourhood: in Kadıköy, for example, the Şehir Hatları and Turyol piers appear as separate stops. Check on the line's page which pier it leaves from.",
        ] },
        { heading: "About the schedule", paragraphs: [
          "Ferry times can change with the season and the weather. GitGel shows timetable times, not live positions.",
        ] },
      ],
    },
  },
  {
    slug: "adalar-vapurlari",
    city: "istanbul",
    lines: ["sehir_hatlari-kbts-emn-kdk-ada", "turyol-kdk-ada", "sehir_hatlari-emn-ada", "sehir_hatlari-bos-ada", "turyol-k-koy-b-ada"],
    stops: ["fer_18948", "fer_94976", "fer_18908"],
    updated: UPDATED,
    tr: {
      title: "Adalar vapurları: Büyükada ve Heybeliada için hatlar ve saatler",
      description: "Adalar'a Kabataş, Eminönü, Kadıköy, Bostancı ve Karaköy'den vapur hatları: ilk ve son sefer, süreler ve iskeleler.",
      intro: "Adalar'a vapurlar Kabataş, Eminönü, Kadıköy, Bostancı ve Karaköy gibi iskelelerden kalkar. Aşağıda seçilmiş hatların saatleri ve süreleri tarife verisinden listelenir.",
      sections: [
        { heading: "Hangi iskeleden gitmeli?", paragraphs: [
          "Bulunduğun yakaya en yakın iskeleyi seç; bazı hatlar Büyükada'ya gitmeden önce diğer adalara uğrar, bu yüzden süre hatlara göre değişir.",
        ] },
        { heading: "Dönüş saatine dikkat", paragraphs: [
          "Akşam son seferlerin saati mevsime göre değişir. Dönüş için hattın son sefer saatine bu sayfadan veya hat sayfasından bak.",
        ] },
      ],
    },
    en: {
      title: "Princes' Islands ferries: lines and times for Büyükada and Heybeliada",
      description: "Ferry lines to the Princes' Islands from Kabataş, Eminönü, Kadıköy, Bostancı and Karaköy: first and last service, durations and piers.",
      intro: "Ferries to the Princes' Islands (Adalar) leave from piers such as Kabataş, Eminönü, Kadıköy, Bostancı and Karaköy. Below, selected lines are listed with times and durations from the timetable data.",
      sections: [
        { heading: "Which pier to use", paragraphs: [
          "Pick the pier closest to where you are; some lines call at other islands before Büyükada, so durations differ by line.",
        ] },
        { heading: "Mind the return time", paragraphs: [
          "The last evening service changes with the season. Check the line's last departure on this page or on the line page before you go.",
        ] },
      ],
    },
  },
  {
    slug: "istanbulkart-nasil-kullanilir",
    city: "istanbul",
    lines: ["m2", "t1", "marmaray", "34", "sehir_hatlari-kdk-emn"],
    stops: [],
    updated: UPDATED,
    tr: {
      title: "İstanbulkart nasıl kullanılır? Metro, otobüs, tramvay ve vapurda geçerli hatlar",
      description: "İstanbulkart'ın metro, otobüs, tramvay, Marmaray ve vapurda kullanımı; örnek hatların saatleri.",
      intro: "İstanbulkart, İstanbul'da toplu taşımada kullanılan ortak karttır. Aşağıda kartla kullanabileceğin ana hat türlerinden örnekler ve saatleri var; güncel ücretler ve kart koşulları için İstanbulkart'ın resmi sayfalarına bak, GitGel ücret göstermez.",
      sections: [
        { heading: "Nerelerde kullanılır?", paragraphs: [
          "Kart; belediye otobüslerinde, metroda, tramvayda, Marmaray'da, metrobüste ve Şehir Hatları vapurlarında kullanılır. Her ulaşım türü için bir örnek hat aşağıdaki tabloda yer alır.",
        ] },
        { heading: "Kartı nasıl doldurursun?", paragraphs: [
          "Bakiye yüklemek için istasyonlardaki ve meydanlardaki dolum noktaları kullanılır. Hangi dolum noktasının nerede olduğunu resmi İstanbulkart kaynaklarından kontrol et.",
        ] },
      ],
    },
    en: {
      title: "How to use the İstanbulkart: metro, bus, tram and ferry lines",
      description: "How the İstanbulkart works on metro, bus, tram, Marmaray and ferries, with example lines and their times.",
      intro: "The İstanbulkart is the shared card for public transport in Istanbul. Below are example lines for the main modes you can use it on, with their times. For current fares and card terms check the official İstanbulkart pages; GitGel does not show fares.",
      sections: [
        { heading: "Where it works", paragraphs: [
          "The card works on municipal buses, the metro, trams, Marmaray, the metrobus and Şehir Hatları ferries. The table below includes one example line for each mode.",
        ] },
        { heading: "Topping up", paragraphs: [
          "Top-up machines are available at stations and squares. Check the official İstanbulkart sources for where to find one.",
        ] },
      ],
    },
  },
  {
    slug: "esenboga-havalimani-kizilay",
    city: "ankara",
    lines: ["442"],
    stops: ["eg_40813", "eg_10968", "eg_11622"],
    updated: UPDATED,
    tr: {
      title: "Esenboğa Havalimanı'ndan Kızılay ve AŞTİ'ye: otobüs 442",
      description: "Esenboğa Havalimanı ile Kızılay ve AŞTİ arasında EGO 442 otobüsü: ilk ve son sefer saatleri, süre ve duraklar.",
      intro: "Esenboğa Havalimanı'ndan şehir merkezine EGO'nun 442 numaralı otobüsü gider; hat AŞTİ ve Kızılay üzerinden havalimanına bağlanır. Saatler tarife verisinden alınmıştır.",
      sections: [
        { heading: "Hat nereden geçer?", paragraphs: [
          "442, AŞTİ'den başlayıp 15 Temmuz Kızılay Milli İrade Meydanı üzerinden havalimanına gider. Kızılay Ankara'nın ana aktarma merkezidir; buradan metro hatlarına geçebilirsin.",
        ] },
        { heading: "Geç saatte iniyorsan", paragraphs: [
          "Hattın son seferini aşağıdaki tablodan kontrol et; uçağın gece geç iniyorsa alternatif olarak taksi ihtiyacı doğabilir.",
        ] },
      ],
    },
    en: {
      title: "Esenboğa Airport to Kızılay and AŞTİ: bus 442",
      description: "EGO bus 442 between Esenboğa Airport and Kızılay or AŞTİ: first and last service, ride time and stops.",
      intro: "EGO's bus 442 runs from Esenboğa Airport to the city centre, calling at Kızılay and AŞTİ. The times come from the timetable data.",
      sections: [
        { heading: "Where the line goes", paragraphs: [
          "Line 442 starts at AŞTİ and reaches the airport via 15 Temmuz Kızılay Milli İrade Meydanı. Kızılay is Ankara's main interchange, where you can change to the metro lines.",
        ] },
        { heading: "If you land late", paragraphs: [
          "Check the line's last service in the table below; if your flight lands late at night you may need a taxi instead.",
        ] },
      ],
    },
  },
  {
    slug: "asti-otogar-ulasim",
    city: "ankara",
    lines: ["a1-d", "a1-g", "442"],
    stops: ["eg_10968", "eg_12018"],
    updated: UPDATED,
    tr: {
      title: "AŞTİ (Ankara otogarı) ulaşım: metro ve otobüs hatları",
      description: "AŞTİ'ye Ankaray (A1) metrosu ve otobüslerle ulaşım: ilk ve son sefer, süreler ve duraklar.",
      intro: "AŞTİ, Ankara'nın şehirlerarası otobüs terminalidir ve Ankaray'ın (A1) bir ucundadır. Aşağıda AŞTİ'yi kullanan metro ve otobüs hatlarının saatleri var.",
      sections: [
        { heading: "Metro ile", paragraphs: [
          "A1 hattı AŞTİ ile Dikimevi arasında çalışır ve Kızılay'dan geçer. Terminalden şehir merkezine en kolay yol genellikle bu hattır.",
        ] },
        { heading: "Otobüsle", paragraphs: [
          "AŞTİ durağından birçok EGO hattı kalkar; hangilerinin geçtiğini aşağıdaki duraklardan görebilirsin.",
        ] },
      ],
    },
    en: {
      title: "Getting to AŞTİ (Ankara intercity bus terminal): metro and bus lines",
      description: "Getting to AŞTİ by the Ankaray (A1) metro and by bus: first and last service, ride times and stops.",
      intro: "AŞTİ is Ankara's intercity bus terminal and sits at one end of the Ankaray (A1) metro line. Below are the metro and bus lines that serve it, with their times.",
      sections: [
        { heading: "By metro", paragraphs: [
          "The A1 line runs between AŞTİ and Dikimevi and passes through Kızılay. It is usually the easiest way from the terminal to the city centre.",
        ] },
        { heading: "By bus", paragraphs: [
          "Many EGO lines depart from the AŞTİ stops; the stops below show which ones.",
        ] },
      ],
    },
  },
  {
    slug: "ankara-universite-kampusleri-ulasim",
    city: "ankara",
    lines: ["130", "176", "111", "110", "175"],
    stops: ["eg_51241", "eg_12908", "eg_10216", "eg_11458", "eg_30071"],
    updated: UPDATED,
    tr: {
      title: "Ankara üniversite kampüslerine ulaşım: ODTÜ, Bilkent, Hacettepe Beytepe, Gazi, Cebeci",
      description: "ODTÜ, Bilkent, Hacettepe Beytepe, Gazi ve Cebeci kampüslerine otobüs durakları ve hatlar; ilk ve son sefer saatleri.",
      intro: "Ankara'nın büyük kampüslerine metro istasyonlarından ve ana duraklardan otobüsle ulaşılır. Aşağıda ODTÜ, Bilkent, Hacettepe Beytepe, Gazi ve Cebeci için GitGel'deki duraklar ve ilgili hatlar var.",
      sections: [
        { heading: "Bilkent ve Beytepe", paragraphs: [
          "Bilkent Metro İstasyonu'ndan Bilkent Üniversitesi'ne 176 ve 111 numaralı hatlar gider; Beytepe Metro İstasyonu'ndan Hacettepe Kampüsü'ne 130 numaralı hat çalışır.",
        ] },
        { heading: "ODTÜ, Gazi ve Cebeci", paragraphs: [
          "ODTÜ, Gazi Üniversitesi ve Cebeci durakları çok sayıda hatla bağlanır. Bineceğin durağın sayfasında o duraktan geçen tüm hatları ve ilk ve son sefer saatlerini görebilirsin.",
        ] },
      ],
    },
    en: {
      title: "Getting to Ankara university campuses: METU, Bilkent, Hacettepe Beytepe, Gazi, Cebeci",
      description: "Bus stops and lines for the METU (ODTÜ), Bilkent, Hacettepe Beytepe, Gazi and Cebeci campuses, with first and last service times.",
      intro: "Ankara's large campuses are reached by bus from metro stations and main stops. Below are the GitGel stops and related lines for METU (ODTÜ), Bilkent, Hacettepe Beytepe, Gazi and Cebeci.",
      sections: [
        { heading: "Bilkent and Beytepe", paragraphs: [
          "From Bilkent Metro Station, lines 176 and 111 go to Bilkent University; from Beytepe Metro Station, line 130 runs to the Hacettepe campus.",
        ] },
        { heading: "METU, Gazi and Cebeci", paragraphs: [
          "The METU, Gazi University and Cebeci stops are served by many lines. A stop's page lists every line that calls there with first and last service times.",
        ] },
      ],
    },
  },
  {
    slug: "ankarakart-ogrenci-ulasim",
    city: "ankara",
    lines: ["a1-d", "m1-d", "m4-d", "442"],
    stops: ["eg_11622", "eg_11458", "eg_51241"],
    updated: UPDATED,
    tr: {
      title: "Ankara'da öğrenci ulaşımı: AnkaraKart ve metro-otobüs hatları",
      description: "Ankara'da yeni gelen öğrenciler için AnkaraKart ve metro, otobüs hatları; Kızılay, Gazi ve ODTÜ durakları.",
      intro: "Ankara'da toplu taşıma AnkaraKart ile kullanılır. Öğrenciler için indirimli kart türü bulunur; başvuru koşulları ve güncel ücretler için EGO'nun resmi sayfalarına bak, GitGel ücret göstermez. Aşağıda öğrencilerin sık kullandığı hatlar var.",
      sections: [
        { heading: "İlk hafta için", paragraphs: [
          "Kızılay ana aktarma noktasıdır: A1, M1 ve M4 metro hatları ve çok sayıda otobüs buradan geçer. Yurt veya ev adresine en yakın metro istasyonunu ve oradan kampüse giden otobüsü belirlemek için GitGel'de durak adını ara.",
        ] },
        { heading: "Uluslararası öğrenciler", paragraphs: [
          "Sitenin İngilizce sayfaları durak ve hat bilgisini aynı veriyle gösterir. Arapça, Farsça ve Rusça sayfalar ilerleyen aşamada eklenecek.",
        ] },
      ],
    },
    en: {
      title: "Student transport in Ankara: AnkaraKart and metro and bus lines",
      description: "For new students in Ankara: the AnkaraKart and the metro and bus lines, with the Kızılay, Gazi and METU stops.",
      intro: "Public transport in Ankara works with the AnkaraKart. A discounted card type exists for students; for eligibility and current fares check EGO's official pages, as GitGel does not show fares. Below are lines students use often.",
      sections: [
        { heading: "For your first week", paragraphs: [
          "Kızılay is the main interchange: the A1, M1 and M4 metro lines and many buses pass through it. To find the metro station closest to your dorm or home and the bus from there to campus, search the stop name in GitGel.",
        ] },
        { heading: "International students", paragraphs: [
          "This site's English pages show the same stop and line data. Arabic, Persian and Russian pages will be added in a later stage.",
        ] },
      ],
    },
  },
  {
    slug: "ankaray-metro-hatlari",
    city: "ankara",
    lines: ["a1-d", "a1-g", "m1-d", "m1-g", "m4-d", "m4-g"],
    stops: ["eg_11622", "eg_30122"],
    updated: UPDATED,
    tr: {
      title: "Ankaray ve Ankara metro hatları: A1, M1, M4 saatleri ve durakları",
      description: "Ankaray (A1) ve M1, M4 metro hatları: ilk ve son sefer saatleri, yolculuk süreleri ve Kızılay aktarması.",
      intro: "Ankara'da raylı sistem A1 (Ankaray), M1 ve M4 hatlarından oluşur. Her hattın iki yönü, ilk ve son sefer saati ve yolculuk süresi aşağıda tarife verisinden listelenir.",
      sections: [
        { heading: "Hatlar", paragraphs: [
          "A1 AŞTİ ile Dikimevi, M1 Çayyolu ile Sincan, M4 ise Keçiören ile Kızılay arasında çalışır.",
        ] },
        { heading: "Aktarma", paragraphs: [
          "Kızılay, hatların buluştuğu ana aktarma noktasıdır. Aktarma yapacaksan iki hattın son seferlerine dikkat et.",
        ] },
      ],
    },
    en: {
      title: "Ankaray and Ankara metro lines: A1, M1, M4 times and stops",
      description: "The Ankaray (A1), M1 and M4 metro lines: first and last service, ride times and the Kızılay interchange.",
      intro: "Rail transport in Ankara consists of the A1 (Ankaray), M1 and M4 lines. Each line's two directions, first and last service and ride time are listed below from the timetable data.",
      sections: [
        { heading: "The lines", paragraphs: [
          "A1 runs between AŞTİ and Dikimevi, M1 between Çayyolu and Sincan, and M4 between Keçiören and Kızılay.",
        ] },
        { heading: "Changing lines", paragraphs: [
          "Kızılay is the main interchange where the lines meet. If you change lines, mind the last services of both.",
        ] },
      ],
    },
  },
  {
    slug: "uludag-teleferik-ulasim",
    city: "bursa",
    lines: [],
    stops: ["br_1818", "br_1514", "br_1816"],
    updated: UPDATED,
    tr: {
      title: "Uludağ teleferiğine ulaşım: Teferrüç ve Teleferik durakları",
      description: "Bursa'da teleferik istasyonuna giden otobüs hatları ve Teleferik, Teferrüç durakları: ilk ve son sefer saatleri.",
      intro: "Uludağ'a çıkan teleferik Bursa'nın Teferrüç semtinden kalkar. Aşağıda adında Teleferik veya Teferrüç geçen durakları ve bu duraklara uğrayan hatları, tarife saatleriyle birlikte listeledik.",
      sections: [
        { heading: "Teleferik duraklarına nasıl gidilir?", paragraphs: [
          "Teleferik 1 ve Teleferik 2 duraklarına uğrayan hatlar aşağıdaki tabloda yer alır. Teferrüç durakları yakın çevredeki alternatiflerdir.",
        ] },
        { heading: "Teleferik saatleri", paragraphs: [
          "Teleferiğin kendi çalışma saatleri bu sayfadaki otobüs saatlerinden farklıdır ve mevsime göre değişir. Gitmeden önce teleferik işletmesinin güncel saatlerini kontrol et.",
        ] },
      ],
    },
    en: {
      title: "Getting to the Uludağ cable car: Teferrüç and Teleferik stops",
      description: "Bus lines to Bursa's cable car station and the Teleferik and Teferrüç stops: first and last service times.",
      intro: "The cable car up Uludağ leaves from Bursa's Teferrüç neighbourhood. Below are the stops with Teleferik or Teferrüç in their name and the lines that call at them, with timetable times.",
      sections: [
        { heading: "Reaching the cable car stops", paragraphs: [
          "The lines that call at the Teleferik 1 and Teleferik 2 stops are in the table below. The Teferrüç stops are alternatives nearby.",
        ] },
        { heading: "Cable car hours", paragraphs: [
          "The cable car's own operating hours differ from the bus times on this page and change with the season. Check the operator's current hours before you go.",
        ] },
      ],
    },
  },
  {
    slug: "gorukle-uludag-universitesi-ulasim",
    city: "bursa",
    lines: [],
    stops: ["br_3251", "br_3244", "br_663"],
    updated: UPDATED,
    tr: {
      title: "Görükle ve Uludağ Üniversitesi'ne ulaşım: hatlar ve duraklar",
      description: "Bursa'da Görükle ve Uludağ Üniversitesi kampüsüne giden otobüs hatları ve durakları; ilk ve son sefer saatleri.",
      intro: "Uludağ Üniversitesi Görükle kampüsü Bursa'nın batısındadır ve çok sayıda otobüs hattıyla bağlanır. Aşağıda kampüs ve Görükle çevresindeki duraklar ile oralara uğrayan hatlar var.",
      sections: [
        { heading: "Hangi durağa inmeli?", paragraphs: [
          "Uludağ Üniv. Görükle Girişi, kampüse en yakın duraklardan biridir; Görükle Sanayi ve Uludağ Üniversitesi İstasyonu durakları da sık kullanılır.",
        ] },
        { heading: "Hat seçimi", paragraphs: [
          "Birçok hat Uludağ Üniversitesi peronuna çıkar. Gideceğin semte göre hattın uç durağına bak.",
        ] },
      ],
    },
    en: {
      title: "Getting to Görükle and Uludağ University: lines and stops",
      description: "Bus lines and stops for Görükle and the Uludağ University campus in Bursa, with first and last service times.",
      intro: "Uludağ University's Görükle campus is in western Bursa and is served by many bus lines. Below are the stops around the campus and Görükle and the lines that call at them.",
      sections: [
        { heading: "Which stop to get off at", paragraphs: [
          "Uludağ Üniv. Görükle Girişi is one of the stops closest to the campus; Görükle Sanayi and Uludağ Üniversitesi İstasyonu are also widely used.",
        ] },
        { heading: "Choosing a line", paragraphs: [
          "Many lines end at the Uludağ University platform. Look at a line's terminus to match it to where you are going.",
        ] },
      ],
    },
  },
  {
    slug: "bursaray-bursakart",
    city: "bursa",
    lines: ["m1", "t1", "t2"],
    stops: ["br_919", "br_565"],
    updated: UPDATED,
    tr: {
      title: "BursaRay ve BursaKart: metro ve tramvay hatları, saatler ve duraklar",
      description: "Bursa'da M1 metro (BursaRay) ve T1, T2 tramvay hatları: ilk ve son sefer saatleri, süreler ve Emek, Kent Meydanı durakları.",
      intro: "Bursa'nın raylı sistemi M1 metro hattı (BursaRay) ile T1 ve T2 tramvay hatlarından oluşur. Toplu taşımada BursaKart kullanılır; ücret ve kart koşulları için işletmenin resmi sayfalarına bak, GitGel ücret göstermez.",
      sections: [
        { heading: "Hatlar", paragraphs: [
          "M1 Arabayatağı İstasyonu ile Emek İstasyonu arasında çalışır. T1 Kent Meydanı çevresinde ring yapar, T2 ise Terminal ile Kent Meydanı arasındadır.",
        ] },
        { heading: "Aktarma noktaları", paragraphs: [
          "Kent Meydanı ve Emek, otobüsle raylı sistem arasında sık kullanılan aktarma noktalarıdır; durak sayfalarından o duraktan geçen hatlara bakabilirsin.",
        ] },
      ],
    },
    en: {
      title: "BursaRay and BursaKart: metro and tram lines, times and stops",
      description: "Bursa's M1 metro (BursaRay) and T1 and T2 tram lines: first and last service, ride times and the Emek and Kent Meydanı stops.",
      intro: "Bursa's rail network consists of the M1 metro line (BursaRay) and the T1 and T2 tram lines. Public transport uses the BursaKart; for fares and card terms check the operator's official pages, as GitGel does not show fares.",
      sections: [
        { heading: "The lines", paragraphs: [
          "M1 runs between Arabayatağı and Emek stations. T1 loops around Kent Meydanı, and T2 runs between Terminal and Kent Meydanı.",
        ] },
        { heading: "Interchanges", paragraphs: [
          "Kent Meydanı and Emek are commonly used interchanges between buses and rail; a stop's page shows the lines that call there.",
        ] },
      ],
    },
  },
];

export const GUIDES: GuideDef[] = [...BASE_GUIDES, ...ISTANBUL_GUIDES, ...ANKARA_GUIDES, ...BURSA_GUIDES];

export const guideBySlug = (slug: string) => GUIDES.find((g) => g.slug === slug);
export const copyFor = (g: GuideDef, lang: Lang): GuideCopy => (lang === "tr" ? g.tr : g.en);
