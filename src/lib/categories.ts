// Single source of truth for the five content categories: their slug (used in
// URLs and frontmatter), display label, and a one-line description used on
// category index pages and in meta descriptions.
export interface CategoryMeta {
  slug: string;
  label: string;
  description: string;
}

export const CATEGORIES: readonly CategoryMeta[] = [
  {
    slug: 'nieruchomosci',
    label: 'Nieruchomości',
    description: 'Rynek, inwestycje, analizy, trendy cenowe i prawo nieruchomości w praktyce.',
  },
  {
    slug: 'architektura',
    label: 'Architektura',
    description: 'Projektowanie, urbanistyka, trendy budowlane i studia przypadków.',
  },
  {
    slug: 'biznes',
    label: 'Biznes',
    description: 'Zarządzanie firmą deweloperską i budowlaną, finansowanie, SPV, cashflow, sprzedaż.',
  },
  {
    slug: 'proptech',
    label: 'PropTech',
    description: 'Technologia w nieruchomościach — narzędzia, automatyzacja, AI w branży.',
  },
  {
    slug: 'conttech',
    label: 'ContTech',
    description: 'Technologia w budownictwie — cyfryzacja placu budowy, BIM, IoT na budowie.',
  },
  {
    slug: 'dane',
    label: 'Dane',
    description: 'Rynek mieszkaniowy w liczbach — pozwolenia na budowę, ceny transakcyjne, GUS i dane.gov.pl.',
  },
  {
    slug: 'kontrowersje',
    label: 'Kontrowersje',
    description: 'Krytyczne spojrzenie na praktyki branży — marketing, standardy, to, co się nie mówi wprost.',
  },
] as const;

// Zod's z.enum() needs a non-empty string tuple; CATEGORIES is the source of
// truth, this just reshapes it for the schema in content.config.ts.
export const CATEGORY_SLUGS = CATEGORIES.map((c) => c.slug) as [string, ...string[]];

export function getCategoryMeta(slug: string): CategoryMeta | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}
