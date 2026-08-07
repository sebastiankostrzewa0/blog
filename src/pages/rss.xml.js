import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { isPublished } from '@/lib/publishing';
import { SITE_TITLE, SITE_DESCRIPTION } from '@/consts';

export async function GET(context) {
  const posts = (await getCollection('blog', isPublished)).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );

  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.excerpt,
      pubDate: post.data.date,
      link: `/${post.data.category}/${post.data.slug}/`,
      categories: [post.data.category, ...post.data.tags],
    })),
    customData: '<language>pl-pl</language>',
  });
}
