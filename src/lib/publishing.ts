import type { CollectionEntry } from 'astro:content';

/**
 * Drafts stay visible in `astro dev` so you can review them locally, but are
 * excluded from the production build - and therefore from every listing,
 * the sitemap and the RSS feed - until you flip `draft: false` in the
 * frontmatter. Flip it when a post is ready to go live and to be indexed.
 */
export function isPublished(entry: Pick<CollectionEntry<'blog'>, 'data'>): boolean {
  return !entry.data.draft || import.meta.env.DEV;
}
