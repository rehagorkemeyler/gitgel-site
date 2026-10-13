# CLAUDE.md: GitGel site

The public website for GitGel, the free transit app for Istanbul, Ankara and Bursa. Its job is search traffic:
one server-rendered page per stop, line and guide (tr and en first, six languages later), each sending people to the app.
The PWA lives at https://rehagorkemeyler.github.io/GitGel/ (repo `rehagorkemeyler/GitGel`), the Android app in
`rehagorkemeyler/gitgel-native`. Read PLAN.md before doing anything: it holds the stages and the current progress.

## The most important rule: stop after every stage

Görkem has a limited Claude subscription and must check his usage between stages. When you finish a stage:
1. Make sure typecheck, lint and tests pass, commit and push.
2. Tick the stage's boxes in PLAN.md and fill its "Sonuç" line (what was done, what is left, live URL). Commit and push.
3. Write a Turkish summary of at most five sentences, then this exact line on its own:
   `DUR: Aşama N bitti. Kullanımını kontrol et. Devam için "yürü" yaz.`
4. End your turn. Never start the next stage in the same turn.

## Working with Görkem

1. Talk to Görkem in Turkish. Keep code, commits and code comments in English.
2. He is not a full-time developer. When he must do something himself (Vercel, Search Console, domain), write a
   "SENİN SIRAN" section with short numbered steps and what he should see, and append it to docs/GORKEM-TODO.md.
3. Ask only about real product decisions PLAN.md does not answer.
4. Never put session links (Claude-Session or any claude.ai URL) in commits, PRs or GitHub comments.

## Saving usage

1. Never read `package-lock.json`, `node_modules`, `.next`, `.git`, or the full city JSON files (stops are MBs):
   inspect data with `head -c 2000` or a small `node -e` that prints keys and counts.
2. Do not explore the PWA or native repos for context. Read only files a stage names.
3. Keep turns lean: no long explanations, no re-summarizing PLAN.md.

## Git

Private repo `rehagorkemeyler/gitgel-site`, no license file. Commit and push directly to `main`.
Never push with a failing typecheck, lint or tests. Vercel deploys `main` automatically.

## Stack (decided)

| Part | Choice |
|---|---|
| Framework | Next.js (latest stable, App Router), React, TypeScript strict |
| Hosting | Vercel Hobby (free). Pages render on first request and are cached (ISR, daily revalidate); prerender only the most visited few hundred |
| Data | The PWA's static JSON on GitHub Pages (`.../GitGel/data/`, `ankara/`, `bursa/`), fetched server-side and cached |
| Languages | Launch with tr, en; ru, de, ar, fa come later (PLAN.md W6). Built for all six (`dir="rtl"` for ar, fa); hreflang alternates for enabled languages |
| Map (only where needed) | MapLibre GL with OpenFreeMap tiles; no Google Maps on the site |
| Tests | Vitest for pure logic (sentence templates, Turkish suffix helper, slugs, sitemap splitting) |

## Product rules

2. Schedule-based data says "tarifeye göre" (translated per language); never present it as live.
3. Every page has the app buttons: "Web'de kullan" -> https://rehagorkemeyler.github.io/GitGel/ , Android download.
4. No popups or modals the visitor did not open. No cookie banner
5. Generated text must be grammatical and specific to the stop or line (Google punishes thin, identical pages).
6. Say clearly that GitGel is independent and not affiliated with İETT, EGO, Metro İstanbul or BURULAŞ.
7. If the data source is down, serve the last cached page; never show an error page for a stop that existed.
