# PLAN.md: GitGel site

Plan for this repo. Same stop-after-every-stage rule as gitgel-native
(see CLAUDE.md). Modeled on varda-antalya.vercel.app (studied 13 Oct 2026).

## Goal

Pull search traffic with one server-rendered page per stop, per line and per guide, in six languages.
Every page sends people to the app: "Web'de kullan" -> https://rehagorkemeyler.github.io/GitGel/ ,
Android -> APK / Play link. Must never cost money (Vercel Hobby, free data).

##

- Next.js on Vercel, pages server-rendered and cached (ISR). ~4.6k stops x 4 languages = ~19k pages.
- Stop page title: `<stop> durağı (<code>) – <line> otobüs saatleri · Varda`; description lists the lines and direction.
- Sentences generated from data, so no two pages are alike: "X durağından 5 hat geçer", opposite-direction
  stop "70 m ötede", first/last departure table, nearby stops with distance and lines (internal links).
- schema.org JSON-LD: BusStop (geo), BreadcrumbList; line pages an ItemList of stops; guides an Article.
- Sitemap index split by language and type. robots.txt allows GPTBot, ClaudeBot, PerplexityBot.
- Weak spots we fix: no hreflang alternates, no own domain (domain comes later from Görkem).

## Languages

One set for all cities: **tr, en, ru, de, ar, fa** (ar and fa are right-to-left).

- Istanbul tourists (2025, ministry data via secondary sources): Russia, Germany, USA/UK, Iran, Saudi Arabia/Gulf
  -> en, ru, de, fa, ar.
- Ankara international students (~19.4k in Ankara, 2024-25). Ankara Üniversitesi, April 2025, foreign students
  by nationality: Azerbaijan 412, Iran 234, Syria 134, Turkmenistan 117, Iraq 116, Kazakhstan 94, Palestine 86,
  Kyrgyzstan 81, Afghanistan 81, Egypt 63, Russia 55, Jordan 51, Uzbekistan 49, Yemen 27.
  By language: Arabic (Syria, Iraq, Palestine, Egypt, Jordan, Yemen) ~480; Persian/Dari (Iran, Afghanistan) ~315;
  Russian as the shared language of Central Asia (Kazakhstan, Kyrgyzstan, Russia, Uzbekistan, many Turkmen and
  Azerbaijani students) ~300+. Azerbaijani and Turkmen speakers read Turkish well, so they are served by tr.
  Nationwide YÖK 2024-25 top four: Syria, Azerbaijan, Turkmenistan, Iran (same picture).
  -> Ankara top three: **ar, fa, ru**, all already in the set.
- Bursa: Gulf tourists (Uludağ) -> ar.

## Scale

Data from the PWA's GitHub Pages JSON (`https://rehagorkemeyler.github.io/GitGel/data/`, `ankara/`, `bursa/`):
Istanbul 13,946 stops / 912 lines, Ankara 10,672 / 647, Bursa 7,535 / 400.
~32k stops + ~2k lines, x 6 languages = ~200k URLs. Do not prerender all at build: render on first request,
cache (ISR, revalidate daily), prerender only the top few hundred. Sitemaps max 50k URLs each.

## Stages

### Stage W0: skeleton and deploy
- [ ] Next.js (App Router, TypeScript strict), `/[lang]` routing for the six languages, `dir="rtl"` for ar/fa
- [ ] Home page per language: short pitch, "Web'de kullan" (PWA link), Android download, city picker
- [ ] Deployed on Vercel from the repo (Görkem connects it), `*.vercel.app` URL works

### Stage W1: stop pages (the main traffic source)
- [ ] Build-time and ISR data loader for the three cities from the PWA JSON (cached, calm fallback if Pages is down)
- [ ] URL: `/[lang]/[city]/stop/[code]-[slug]`, canonical + hreflang alternates for all six languages
- [ ] Template: title/description pattern, lines at this stop, direction, opposite-direction stop and distance,
      first/last departures (weekday, "tarifeye göre"), nearby stops, app buttons, JSON-LD BusStop + Breadcrumb
- [ ] Sentence templates in Turkish first (correct suffixes: durağından/durağına, vowel harmony helper with tests)
- [ ] Sitemaps per city/language/type, robots.txt

### Stage W2: line pages and lists
- [ ] Line page: route, stops in order both directions, departure times, JSON-LD ItemList
- [ ] Line list per city, stop search page, internal links between stops and lines

### Stage W3: translations
- [ ] UI strings and sentence templates in en, ru, de, ar, fa (stop names stay as published)
- [ ] RTL layout check for ar/fa

### Stage W4: guides (hand-picked search topics, numbers from the data)
- [ ] Istanbul: IST and SAW airports to Taksim/Sultanahmet/Kadıköy, Istanbulkart, Metrobüs, ferries
      (Kadıköy-Eminönü/Karaköy, Adalar), Marmaray, night transport
- [ ] Ankara (for international students): Esenboğa to Kızılay, AŞTİ, campuses (ODTÜ, Bilkent, Hacettepe Beytepe,
      Gazi, Ankara Üni. Gölbaşı/Cebeci), student AnkaraKart, Ankaray/metro
- [ ] Bursa: Uludağ cable car, Görükle (Uludağ Üniversitesi), BursaRay, BursaKart
- [ ] JSON-LD Article, "updated" date, links to the stop and line pages they mention

### Stage W5: launch and measure
- [ ] Google Search Console (Görkem), sitemap submitted, Core Web Vitals check, Vercel usage within Hobby limits

### Stage W6 (last, optional): scroll-ride landing
- [ ] Varda-style scroll story on MapLibre (OpenFreeMap + AWS terrain, no paid imagery), e.g. Kadıköy-Eminönü ferry
