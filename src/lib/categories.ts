// Single source of truth for content categories: their slug (used in URLs and
// frontmatter), display label, and a one-line description used on category
// index pages and in meta descriptions.
export interface CategoryMeta {
  slug: string;
  label: string;
  description: string;
}

export const CATEGORIES: readonly CategoryMeta[] = [
  {
    slug: 'analizy',
    label: 'Analizy',
    description: 'Rynek mieszkaniowy w liczbach - dane, trendy, struktury inwestycyjne i to, co za nimi stoi.',
  },
  {
    slug: 'prawo',
    label: 'Prawo i regulacje',
    description: 'Zmiany w prawie i formalności, które branża zauważa dopiero, gdy jest za późno na reakcję.',
  },
  {
    slug: 'technologia',
    label: 'Technologia',
    description: 'Narzędzia, automatyzacja i AI w nieruchomościach oraz na placu budowy.',
  },
  {
    slug: 'design',
    label: 'Architektura i Design',
    description: 'Projektowanie i decyzje architektoniczne, które później kosztują albo oszczędzają miliony w realizacji.',
  },
] as const;

// Zod's z.enum() needs a non-empty string tuple; CATEGORIES is the source of
// truth, this just reshapes it for the schema in content.config.ts.
export const CATEGORY_SLUGS = CATEGORIES.map((c) => c.slug) as [string, ...string[]];

export function getCategoryMeta(slug: string): CategoryMeta | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}
