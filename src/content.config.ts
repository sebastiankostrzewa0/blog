import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { CATEGORY_SLUGS } from '@/lib/categories';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string().max(100),
    // Canonical slug used for the post URL (/<category>/<slug>/), independent
    // of the markdown filename so posts can be renamed on disk freely.
    slug: z.string(),
    date: z.coerce.date(),
    category: z.enum(CATEGORY_SLUGS),
    tags: z.array(z.string()).max(4).default([]),
    excerpt: z.string().max(220),
    author: z.string().default('Sebastian'),
    // Optional manual override — by default reading time is computed from the
    // post's word count at render time (see src/lib/format.ts#readingTime).
    readingTime: z.number().int().positive().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
