# Meridian — blog na Astro

Prosty, responsywny blog na [Astro](https://astro.build) z treścią w Markdown, zbudowany
pod dobre SEO i design zgodny z paletą: papier `#E7E9E2`, atrament `#1B2A3A`, sygnał
`#D6491F`, fonty Big Shoulders Display + Inter + IBM Plex Mono.

## Start

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # typecheck + build statyczny do dist/
npm run preview   # podgląd builda produkcyjnego
```

## Zanim wdrożysz na produkcję

1. **Ustaw domenę** — w `astro.config.mjs` zmień `SITE_URL` na docelowy adres. Wpływa on
   na canonical URL-e, sitemapę, RSS i adresy obrazków OG.
2. Podmień `SITE_AUTHOR` / `SITE_TITLE` / `SITE_DESCRIPTION` w `src/consts.ts`, jeśli
   chcesz innej nazwy niż „Meridian”.

## Struktura treści

Artykuły to pliki Markdown w `src/content/blog/*.md`, walidowane schematem Zod
(`src/content.config.ts`):

```md
---
title: "Tytuł artykułu"
description: "Krótki opis (do 200 znaków) — trafia w meta description i OG."
pubDate: 2026-01-12
updatedDate: 2026-02-01   # opcjonalnie
tags: ["tag-jeden", "tag-dwa"]
draft: false               # true = nie trafia do builda
---

Treść w Markdown...
```

Nowy plik w tym katalogu = nowy wpis, automatycznie widoczny w `/blog/`, w RSS,
w sitemapie i na stronach tagów `/tags/<tag>/`.

## SEO wbudowane w projekt

- **Meta tagi** — tytuł, opis, canonical URL, `robots` — generowane przez
  `src/components/SEO.astro` dla każdej strony.
- **Open Graph + Twitter Card** — pełny zestaw tagów (`og:*`, `twitter:*`).
- **Dynamiczne obrazki OG** (1200×630) — generowane w czasie builda dla każdego wpisu
  (`src/pages/og/[...slug].png.ts`) i jednej domyślnej (`/og/default.png`), w stylu
  zgodnym z paletą i typografią bloga. Silnik: `satori` + `@resvg/resvg-wasm` — bez
  natywnych zależności (żadnego `sharp`/`cairo`), więc build działa wszędzie tam, gdzie
  działa Node.
- **JSON-LD** — `BlogPosting` dla wpisów, `WebSite` dla reszty stron.
- **Sitemap** — `@astrojs/sitemap`, generowana automatycznie przy buildzie
  (`/sitemap-index.xml`).
- **RSS** — `/rss.xml` (`@astrojs/rss`).
- **`robots.txt`** — generowany dynamicznie (`src/pages/robots.txt.ts`), zawsze wskazuje
  na aktualną sitemapę.

## Design

Wszystkie tokeny kolorów i fontów są w `src/styles/global.css` (custom properties
`--color-*`, `--font-*`). Fonty są self-hosted przez `@fontsource` (brak zewnętrznych
requestów do Google Fonts — lepszy performance i prywatność).

- **Big Shoulders Display** (800/900) — nagłówki, wersaliki.
- **Inter** — tekst.
- **IBM Plex Mono** — metadane, tagi, elementy techniczne.

Menu mobilne jest czystym CSS (`<details>/<summary>`) — działa bez JavaScriptu.

## Regeneracja ikon

Jeśli zmienisz `public/favicon.svg`, przelicz PNG-i:

```bash
node scripts/gen-icons.mjs
```
