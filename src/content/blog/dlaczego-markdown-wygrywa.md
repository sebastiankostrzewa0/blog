---
title: "Dlaczego Markdown wygrywa z edytorem WYSIWYG"
description: "Zwykły plik tekstowy przetrwa każdą migrację. O przewadze pisania w Markdown nad zamkniętymi edytorami treści."
pubDate: 2026-05-20
tags: ["markdown", "warsztat", "narzędzia"]
---

Kiedy piszesz w edytorze WYSIWYG osadzonym w konkretnym systemie CMS, tak naprawdę piszesz w formacie tego systemu. Za pięć lat, gdy zechcesz przenieść treść gdzie indziej, eksport bywa bolesny: zagnieżdżone `<div>`, inline style, znaczniki, których nikt już nie rozumie.

## Plik tekstowy nie ma daty ważności

Markdown to zwykły tekst z kilkoma znakami specjalnymi. Otworzysz go za dekadę w dowolnym edytorze, bez konwertera, bez licencji, bez martwienia się, czy firma stojąca za CMS-em jeszcze istnieje.

```md
## Nagłówek
To jest **pogrubienie** i to jest [link](/przyklad).
```

Ten fragment wygląda dziś tak samo, jak będzie wyglądał w 2040 roku.

## Mniej pokus, więcej treści

Edytor WYSIWYG kusi, żeby bawić się kolorem czcionki i rozmiarem nagłówka w połowie akapitu. Markdown fizycznie na to nie pozwala — masz nagłówki, listy, cytaty, pogrubienie, kursywę i link. Ograniczenie okazuje się zaletą: skupia uwagę na treści, nie na dekoracji.

## Kontrola nad wersją

Plik `.md` trzyma się dobrze w systemie kontroli wersji. Widzisz dokładnie, co zmieniło się między wersjami artykułu, możesz cofnąć pojedynczą zmianę, możesz pracować offline. To samo podejście, które sprawdza się w kodzie, sprawdza się też w treści.

Statyczne generatory stron, takie jak Astro, biorą ten prosty plik i zamieniają go w responsywną, szybką stronę — bez utraty tej podstawowej zalety: treść zostaje czytelna sama w sobie, niezależnie od narzędzia, które ją renderuje.
