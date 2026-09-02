# sebastiankostrzewa0/blog

Osobisty blog Sebastiana Kostrzewy o branży nieruchomości/PropTech
(analizy, prawo, technologia, design). Astro 7 + Markdown content
collections, hosting na Vercel (`@astrojs/vercel` adapter tylko po to,
żeby `src/pages/api/subscribe.ts` mógł działać on-demand - reszta strony
jest w pełni statyczna).

## Branch

`claude/astro-blog-markdown-seo-5brx3n` jest obecnie domyślnym branchem
repozytorium i tym, z którego Vercel wdraża produkcję. Pracuj bezpośrednio
na nim, chyba że dostaniesz inne wyraźne instrukcje.

## Publikowanie nowych postów

Gdy dostajesz od użytkownika plik `.md` z nowym artykułem (frontmatter
zgodny ze schematem w `src/content.config.ts`):

- **Data dzisiejsza lub przeszła** -> dodaj od razu do `src/content/blog/`
  (nazwa pliku = wartość `slug` z frontmatter), zbuduj (`npm run build`),
  zacommituj i wypchnij na branch produkcyjny. Publikacja jest natychmiastowa.
- **Data w przyszłości** -> zamiast tego zapisz plik w `scheduled/`
  (też pod nazwą `<slug>.md`). Nie trafia jeszcze do content collection,
  więc nie jest widoczny na stronie. Zobacz `scheduled/README.md`.

## Automatyczna publikacja zaplanowanych postów

Codziennie o 6:00 UTC odpala się osobna, samodzielna sesja (Claude Code
Remote Routine, `trig_01RQrtc3eyoLMe93UpYw65mW`), która wykonuje dokładnie
to:

1. Sklonuj/zaktualizuj repo (`add_repo` jeśli sesja go jeszcze nie ma),
   przełącz się na `claude/astro-blog-markdown-seo-5brx3n`, `git pull`.
2. Ustal listę "dojrzałych" plików **deterministycznie skryptem powłoki**,
   nie na oko - 2.09.2026 pokazało, że poleganie na własnej ocenie dat
   przez model zawodzi (routine zakończył się "sukcesem", ale nic nie
   opublikował mimo dojrzałego posta). Użyj dokładnie tego wzorca:

   ```bash
   today=$(date -u +%Y-%m-%d)
   for f in scheduled/*.md; do
     base=$(basename "$f")
     [ "$base" = "README.md" ] && continue
     post_date=$(grep -m1 '^date:' "$f" | sed -E 's/^date:[[:space:]]*"?([0-9]{4}-[0-9]{2}-[0-9]{2}).*/\1/')
     if [[ "$post_date" < "$today" || "$post_date" == "$today" ]]; then
       echo "DUE: $f"
     fi
   done
   ```

   Porównanie stringów w formacie `YYYY-MM-DD` jest bezpieczne
   leksykograficznie. Plik bez poprawnie sparsowanej daty to błąd do
   zaraportowania, nie "jeszcze nie dojrzały".
3. Każdy plik oznaczony `DUE` przenieś z `scheduled/<plik>.md` do
   `src/content/blog/<slug>.md` (nazwa = `slug` z frontmatter), usuwając
   go z `scheduled/`.
4. Jeśli coś przeniesiono: `npm run build` żeby upewnić się, że strona
   nadal się buduje (uwaga na limit 220 znaków dla `excerpt`), potem
   commit (w treści wymień tytuły opublikowanych postów) i push
   bezpośrednio na branch - to zadanie ma stałą zgodę na push bez
   pytania o potwierdzenie.
5. Jeśli skrypt nie oznaczył żadnego pliku jako `DUE`, nie rób nic i nie
   commituj - cichy no-op.
6. Nigdy nie przenoś posta, którego `post_date` jest wciąż w przyszłości
   względem `today` ze skryptu.
