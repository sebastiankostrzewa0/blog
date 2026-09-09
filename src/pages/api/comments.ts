import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { addComment, isValidAuthorName, isValidCommentContent, listComments } from '@/lib/comments';

// Same reasoning as src/pages/api/subscribe.ts: this route needs to read
// and write Supabase per request, so it opts out of prerendering while the
// rest of the site stays fully static.
export const prerender = false;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function isKnownSlug(slug: string): Promise<boolean> {
  const posts = await getCollection('blog');
  return posts.some((post) => post.data.slug === slug);
}

export const GET: APIRoute = async ({ url }) => {
  const slug = url.searchParams.get('slug');
  if (typeof slug !== 'string' || slug.trim() === '') {
    return json({ ok: false, error: 'invalid_request' }, 400);
  }

  const result = await listComments(slug);
  if (!result.ok) return json({ ok: false, error: result.error }, 502);

  return json({ ok: true, comments: result.comments });
};

export const POST: APIRoute = async ({ request }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'invalid_request' }, 400);
  }

  if (typeof body !== 'object' || body === null) {
    return json({ ok: false, error: 'invalid_request' }, 400);
  }

  const { slug, name, content, website } = body as Record<string, unknown>;

  // Honeypot: same pattern as the newsletter form. A bot that fills every
  // input trips it - reject silently with a fake success so it has no
  // signal to learn from, and don't touch the database.
  if (typeof website === 'string' && website.trim() !== '') {
    return json({ ok: true });
  }

  if (typeof slug !== 'string' || slug.trim() === '' || !(await isKnownSlug(slug))) {
    return json({ ok: false, error: 'invalid_request' }, 400);
  }

  if (!isValidAuthorName(name)) {
    return json({ ok: false, error: 'invalid_name' }, 400);
  }

  if (!isValidCommentContent(content)) {
    return json({ ok: false, error: 'invalid_content' }, 400);
  }

  const result = await addComment(slug, name.trim(), content.trim());
  if (!result.ok) return json({ ok: false, error: result.error }, 502);

  return json({ ok: true });
};
