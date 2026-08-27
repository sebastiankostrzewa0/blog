# Zaplanowane posty

Wrzucaj tutaj pliki `.md` z artykułami, które mają data publikacji w
przyszłości. Frontmatter ma dokładnie taki sam format jak w
`src/content/blog/` (zobacz schemat w `src/content.config.ts`).

Raz dziennie automatyzacja (Claude Code Remote Routine) sprawdza ten
folder: każdy plik, którego pole `date` już nadeszło (dziś lub wcześniej),
zostaje przeniesiony do `src/content/blog/<slug>.md`, a zmiana jest
commitowana i pushowana na branch produkcyjny - Vercel wdraża ją
automatycznie.

Nie edytuj tutaj postów, które już zostały opublikowane - te żyją
w `src/content/blog/`.
