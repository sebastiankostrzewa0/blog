# Blog - Sebastian Kostrzewa

Osobisty blog o rynku nieruchomości widzianym od środka branży - analizy, prawo,
technologia i design. Zbudowany na [Astro](https://astro.build): treść to pliki
Markdown w repo, bez CMS-a i bez panelu admina.

## Szybki start

```bash
npm install
npm run dev       # http://localhost:4321 - pokazuje też posty z draft: true
npm run build     # typecheck + build do dist/ i .vercel/output/ (drafty pominięte)
npm run preview   # podgląd builda produkcyjnego
```

Do lokalnego zapisu do newslettera potrzebny jest plik `.env` - patrz sekcja
Newsletter niżej. Bez niego endpoint `/api/subscribe` odpowiada kontrolowanym
błędem zamiast się wywalać.

## Jak dodać nowy post

1. Stwórz plik `.md` w `src/content/blog/`, np. `src/content/blog/moj-nowy-post.md`.
2. Uzupełnij frontmatter:

   ```yaml
   ---
   title: "Tytuł artykułu"
   slug: "tytul-artykulu"          # trafia do URL-a: /<category>/<slug>/
   date: 2026-08-13
   category: "analizy"              # analizy | prawo | technologia | design
   tags: ["SPV", "cashflow"]        # 0-4 tagi, trafiają na strony /tag/<tag>/
   excerpt: "Jedno-dwa zdania streszczenia - widoczne na liście i w meta description."
   author: "Sebastian"
   draft: true                      # true = widoczny tylko w `npm run dev`
   ---
   ```

3. Napisz treść w Markdown pod frontmatterem.
4. Dopóki `draft: true`, post jest widoczny lokalnie (`npm run dev`), ale **nie**
   trafia do builda produkcyjnego - nie ma go w żadnej liście, w sitemapie ani w RSS,
   więc nic niedopracowanego nie zostanie zaindeksowane. Gdy artykuł jest gotowy,
   zmień na `draft: false`.
5. Czas czytania liczy się automatycznie z liczby słów - nie trzeba go wpisywać
   ręcznie (frontmatter dopuszcza opcjonalne pole `readingTime`, gdybyś kiedyś
   chciał nadpisać wyliczoną wartość).
6. Kategorię trzeba wybrać z zamkniętej listy czterech wartości zdefiniowanej w
   `src/lib/categories.ts` - tam też zmienisz etykiety lub opisy kategorii,
   gdyby się okazały niedoszlifowane.

Filename pliku `.md` nie ma znaczenia dla URL-a - o adresie decyduje `slug` we
frontmatterze, więc możesz swobodnie zmieniać/organizować nazwy plików w repo.

## Struktura strony

- `/` - hero dwukolumnowy: intro po lewej, 3-4 najnowsze artykuły (skrótowo,
  bez excerptów) po prawej.
- `/blog/` - pełna lista wszystkich artykułów, z zakładkami kategorii u góry.
- `/kategoria/<slug>/` - ta sama lista, przefiltrowana do jednej kategorii (zakładki
  na `/blog/` i na stronach kategorii to jeden spójny mechanizm filtrowania -
  4 kategorie zdefiniowane w `src/lib/categories.ts`: `analizy`, `prawo`,
  `technologia`, `design`, poza głównym navbarem).
- `/<kategoria>/<slug>/` - pojedynczy artykuł (permalink używa sluga kategorii
  bezpośrednio, bez prefiksu `/kategoria/`), na końcu 2-3 powiązane (ta sama kategoria).
- `/tag/<tag>/` - lista artykułów z danym tagiem.
- `/newsletter/` - dłuższa wersja sekcji zapisu z homepage.
- `/o-mnie/` - bio, link do Raisly i LinkedIn.
- `/kontakt/` - link `mailto:` i LinkedIn, bez formularza/backendu.
- `/polityka-prywatnosci/` - RODO, wymagane przy zbieraniu e-maili (`noindex`
  do czasu uzupełnienia placeholderów - patrz sekcja Newsletter poniżej).
- `/rss.xml`, `/sitemap-index.xml`, `/robots.txt` - generowane automatycznie.

Nawigacja główna: Blog / Newsletter / O mnie / Kontakt (`src/consts.ts` →
`NAV_LINKS`).

## Zanim wdrożysz na produkcję

1. **Domena** - w `astro.config.mjs` zmień `SITE_URL` (obecnie placeholder) na
   docelowy adres. Wpływa na canonical URL-e, sitemapę, RSS i linki OG.
2. **Raisly** - w `src/consts.ts` podmień `RAISLY_URL` na prawdziwy adres
   (oznaczony `// TODO`). LinkedIn i e-mail kontaktowy są już docelowe.
3. **Alt text obrazków** - jeśli dodajesz zdjęcia do treści postów, zawsze
   dopisz opisowy `alt`, np. `![Wykres cen mieszkań w Warszawie 2020-2026](...)`
   zamiast pustego atrybutu.

## SEO / GEO

- Meta title + description per strona, generowane z frontmattera (`src/components/SEO.astro`).
- Open Graph + Twitter Card, w tym obrazek OG 1200×630 generowany automatycznie
  dla każdego artykułu w czasie builda (`src/lib/og.ts`, satori + resvg-wasm -
  bez `sharp`, bez natywnych zależności) - nakłada tytuł i kategorię na grafikę
  w stylu bloga, nic nie trzeba przygotowywać ręcznie.
- Schema.org `Article` (JSON-LD) z `author`, `datePublished`, `headline` na
  każdym artykule; `WebSite` na pozostałych stronach.
- Czytelne URL-e: `/prawo/jak-rozliczyc-transze-bankowa/`, żadnych `?id=`.
- Jeden `<h1>` na stronę, hierarchia H1→H2→H3 w treści Markdown.

## Design

Paleta i fonty jako custom properties w `src/styles/global.css`:

- Papier `#E7E9E2`, atrament `#1B2A3A`, sygnał `#D6491F`, siatka `#7C8B93`.
- Nagłówki: Big Shoulders Display (700/900). Tekst: Inter (400/500/600).
  Metadane/tagi/daty: IBM Plex Mono (400/500) - wszystko self-hosted przez
  `@fontsource`, zero requestów do Google Fonts.
- Delikatna siatka blueprintu w tle hero (`.blueprint-grid` w `global.css`).
- Kategorie jako małe mono-labelki (`CategoryBadge.astro`).
- Menu mobilne to czysty CSS (`<details>/<summary>`) - działa bez JavaScriptu.

## Newsletter (zbieranie adresów - bez wysyłki)

Na tym etapie formularz newslettera (homepage + `/newsletter/`) tylko zapisuje
adresy e-mail do Supabase. Nie ma jeszcze wysyłki maili ani double opt-in -
to świadomie osobny, kolejny etap.

**Setup:**

1. Załóż darmowy projekt na [supabase.com](https://supabase.com), region
   **EU / Frankfurt** (istotne z uwagi na RODO).
2. W SQL Editorze projektu uruchom `supabase/schema.sql` - tworzy tabelę
   `newsletter_subscribers` (email unikalny, `confirmed` zawsze `false` na
   razie, zarezerwowane pod przyszły double opt-in).
3. Skopiuj `Project URL` i `anon public` key z Project Settings → API.
4. Lokalnie: skopiuj `.env.example` do `.env` i wklej tam te wartości.
   Na Vercelu: dodaj `SUPABASE_URL` i `SUPABASE_ANON_KEY` jako zmienne
   środowiskowe projektu (Settings → Environment Variables).

**Jak to działa:** `src/pages/api/subscribe.ts` (jedyny endpoint w projekcie
renderowany on-demand, nie w buildzie) waliduje e-mail i zgodę po stronie
serwera, odrzuca ciszej boty przez honeypot, i wywołuje REST API Supabase
bezpośrednio przez `fetch` (`src/lib/newsletter.ts`) - bez klienta
`@supabase/supabase-js`, żeby nie dokładać zależności do jednego insertu.
Duplikat e-maila (unique constraint) Supabase zwraca jako 409, co endpoint
tłumaczy na przyjazny komunikat "już jesteś zapisany/a", nie błąd.

Zanim włączysz zapisy na produkcji: uzupełnij `/polityka-prywatnosci/`
(placeholdery `[...]` w treści) i usuń `noindex` z tej strony w
`src/pages/polityka-prywatnosci.astro`.

**Celowo NIE zrobione na tym etapie:** integracja z dostawcą wysyłki
(Buttondown/Resend/Mailchimp), potwierdzanie maila (double opt-in), panel do
przeglądania subskrybentów - listę i tak widać w panelu Supabase.

## Deploy (Vercel)

Strona jest w większości statyczna, ale endpoint zapisu do newslettera
potrzebuje serwera w czasie żądania, więc projekt używa adaptera
`@astrojs/vercel` (`output: "static"` + `adapter: vercel()` w
`astro.config.mjs`) - tylko `src/pages/api/subscribe.ts` ma
`export const prerender = false`, reszta stron nadal jest prerenderowana
przy buildzie. `astro build` produkuje wynik od razu w formacie Vercel
Build Output API (`.vercel/output/`), więc `vercel.json` nie ustawia już
`buildCommand`/`outputDirectory` - wystarczy podłączyć repo i dodać zmienne
środowiskowe z sekcji Newsletter powyżej.

## Regeneracja ikon

Jeśli zmienisz `public/favicon.svg`, przelicz PNG-i:

```bash
node scripts/gen-icons.mjs
```

## Czego tu celowo nie ma

Zgodnie z założeniami: brak CMS-a i panelu admina (posty edytuje się jako
pliki `.md`), brak systemu komentarzy. Newsletter zbiera adresy (patrz wyżej),
ale bez wysyłki, potwierdzania maila i panelu subskrybentów - to celowo
osobne, kolejne etapy.
