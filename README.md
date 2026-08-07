# Blog — Sebastian Kostrzewa

Osobisty blog o nieruchomościach, PropTech, ContTech, architekturze i biznesie.
Zbudowany na [Astro](https://astro.build): treść to pliki Markdown w repo, bez CMS-a
i bez panelu admina.

## Szybki start

```bash
npm install
npm run dev       # http://localhost:4321 — pokazuje też posty z draft: true
npm run build     # typecheck + build statyczny do dist/ (drafty pominięte)
npm run preview   # podgląd builda produkcyjnego z dist/
```

## Jak dodać nowy post

1. Stwórz plik `.md` w `src/content/blog/`, np. `src/content/blog/moj-nowy-post.md`.
2. Uzupełnij frontmatter:

   ```yaml
   ---
   title: "Tytuł artykułu"
   slug: "tytul-artykulu"          # trafia do URL-a: /<category>/<slug>/
   date: 2026-08-13
   category: "biznes"               # nieruchomosci | architektura | biznes | proptech | conttech
   tags: ["SPV", "cashflow"]        # 0-4 tagi, trafiają na strony /tag/<tag>/
   excerpt: "Jedno-dwa zdania streszczenia — widoczne na liście i w meta description."
   author: "Sebastian"
   draft: true                      # true = widoczny tylko w `npm run dev`
   ---
   ```

3. Napisz treść w Markdown pod frontmatterem.
4. Dopóki `draft: true`, post jest widoczny lokalnie (`npm run dev`), ale **nie**
   trafia do builda produkcyjnego — nie ma go w żadnej liście, w sitemapie ani w RSS,
   więc nic niedopracowanego nie zostanie zaindeksowane. Gdy artykuł jest gotowy,
   zmień na `draft: false`.
5. Czas czytania liczy się automatycznie z liczby słów — nie trzeba go wpisywać
   ręcznie (frontmatter dopuszcza opcjonalne pole `readingTime`, gdybyś kiedyś
   chciał nadpisać wyliczoną wartość).
6. Kategorię trzeba wybrać z zamkniętej listy pięciu wartości zdefiniowanej w
   `src/lib/categories.ts` — tam też zmienisz etykiety lub opisy kategorii,
   gdyby się okazały niedoszlifowane.

Filename pliku `.md` nie ma znaczenia dla URL-a — o adresie decyduje `slug` we
frontmatterze, więc możesz swobodnie zmieniać/organizować nazwy plików w repo.

## Struktura strony

- `/` — hero + najnowszy artykuł wyróżniony + reszta.
- `/<kategoria>/` — lista artykułów z danej kategorii (5 kategorii na stałe w nawigacji).
- `/<kategoria>/<slug>/` — pojedynczy artykuł, na końcu 2-3 powiązane (ta sama kategoria).
- `/tag/<tag>/` — lista artykułów z danym tagiem.
- `/o-mnie/` — bio, link do Raisly i LinkedIn.
- `/rss.xml`, `/sitemap-index.xml`, `/robots.txt` — generowane automatycznie.

## Zanim wdrożysz na produkcję

1. **Domena** — w `astro.config.mjs` zmień `SITE_URL` (obecnie placeholder) na
   docelowy adres. Wpływa na canonical URL-e, sitemapę, RSS i linki OG.
2. **Linki społecznościowe** — w `src/consts.ts` podmień `RAISLY_URL` i
   `LINKEDIN_URL` na prawdziwe adresy (oznaczone `// TODO`).
3. **Strona „O mnie”** (`src/pages/o-mnie.astro`) zawiera fragment `[do
   uzupełnienia]` w bio — dopisz realną notę o doświadczeniu.
4. **Alt text obrazków** — jeśli dodajesz zdjęcia do treści postów, zawsze
   dopisz opisowy `alt`, np. `![Wykres cen mieszkań w Warszawie 2020-2026](...)`
   zamiast pustego atrybutu.

## SEO / GEO

- Meta title + description per strona, generowane z frontmattera (`src/components/SEO.astro`).
- Open Graph + Twitter Card, w tym obrazek OG 1200×630 generowany automatycznie
  dla każdego artykułu w czasie builda (`src/lib/og.ts`, satori + resvg-wasm —
  bez `sharp`, bez natywnych zależności) — nakłada tytuł i kategorię na grafikę
  w stylu bloga, nic nie trzeba przygotowywać ręcznie.
- Schema.org `Article` (JSON-LD) z `author`, `datePublished`, `headline` na
  każdym artykule; `WebSite` na pozostałych stronach.
- Czytelne URL-e: `/biznes/jak-rozliczyc-transze-bankowa/`, żadnych `?id=`.
- Jeden `<h1>` na stronę, hierarchia H1→H2→H3 w treści Markdown.

## Design

Paleta i fonty jako custom properties w `src/styles/global.css`:

- Papier `#E7E9E2`, atrament `#1B2A3A`, sygnał `#D6491F`, siatka `#7C8B93`.
- Nagłówki: Big Shoulders Display (700/900). Tekst: Inter (400/500/600).
  Metadane/tagi/daty: IBM Plex Mono (400/500) — wszystko self-hosted przez
  `@fontsource`, zero requestów do Google Fonts.
- Delikatna siatka blueprintu w tle hero (`.blueprint-grid` w `global.css`).
- Kategorie jako małe mono-labelki (`CategoryBadge.astro`).
- Menu mobilne to czysty CSS (`<details>/<summary>`) — działa bez JavaScriptu.

## Deploy (Vercel)

Build jest w pełni statyczny (`output: "static"` w `astro.config.mjs`) — Vercel
wykrywa Astro automatycznie, `vercel.json` w repo tylko to potwierdza jawnie
(`buildCommand: npm run build`, `outputDirectory: dist`). Wystarczy podłączyć
repo w Vercelu; nie jest potrzebny żaden adapter ani zmienne środowiskowe.

## Regeneracja ikon

Jeśli zmienisz `public/favicon.svg`, przelicz PNG-i:

```bash
node scripts/gen-icons.mjs
```

## Czego tu celowo nie ma

Zgodnie z założeniami: brak CMS-a i panelu admina (posty edytuje się jako
pliki `.md`), brak newslettera/zapisu i brak systemu komentarzy — to osobne
etapy na później.
