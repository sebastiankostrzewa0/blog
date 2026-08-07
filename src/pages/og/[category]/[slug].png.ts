import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { generateOgImage } from '@/lib/og';
import { getCategoryMeta } from '@/lib/categories';
import { isPublished } from '@/lib/publishing';

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getCollection('blog', isPublished);
  return posts.map((post) => ({
    params: { category: post.data.category, slug: post.data.slug },
    props: { title: post.data.title, category: post.data.category, tags: post.data.tags },
  }));
};

export const GET: APIRoute = async ({ props }) => {
  const { title, category, tags } = props as { title: string; category: string; tags: string[] };
  const eyebrow = getCategoryMeta(category)?.label ?? category;
  const png = await generateOgImage({ title, eyebrow: eyebrow.toUpperCase(), meta: tags });
  return new Response(Buffer.from(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
