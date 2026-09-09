// Same approach as src/lib/newsletter.ts: talks to Supabase's REST API
// (PostgREST) directly over fetch, no @supabase/supabase-js client - the
// only operations needed here are a simple insert and a filtered select.

export interface Comment {
  id: string;
  author_name: string;
  content: string;
  created_at: string;
}

export function isValidAuthorName(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length >= 1 && value.trim().length <= 80;
}

export function isValidCommentContent(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length >= 1 && value.trim().length <= 2000;
}

function supabaseConfig() {
  const url = import.meta.env.SUPABASE_URL;
  const key = import.meta.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return { url, key };
}

export type AddCommentResult = { ok: true } | { ok: false; error: 'not_configured' | 'server_error' };

export async function addComment(slug: string, authorName: string, content: string): Promise<AddCommentResult> {
  const config = supabaseConfig();
  if (!config) {
    console.error('Comments: SUPABASE_URL / SUPABASE_ANON_KEY are not set.');
    return { ok: false, error: 'not_configured' };
  }

  try {
    const res = await fetch(`${config.url}/rest/v1/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: config.key,
        Authorization: `Bearer ${config.key}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ post_slug: slug, author_name: authorName, content }),
    });

    if (res.ok) return { ok: true };

    console.error('Comments: Supabase returned', res.status, await res.text());
    return { ok: false, error: 'server_error' };
  } catch (err) {
    console.error('Comments: request to Supabase failed', err);
    return { ok: false, error: 'server_error' };
  }
}

export type ListCommentsResult = { ok: true; comments: Comment[] } | { ok: false; error: 'not_configured' | 'server_error' };

export async function listComments(slug: string): Promise<ListCommentsResult> {
  const config = supabaseConfig();
  if (!config) {
    console.error('Comments: SUPABASE_URL / SUPABASE_ANON_KEY are not set.');
    return { ok: false, error: 'not_configured' };
  }

  try {
    const params = new URLSearchParams({
      post_slug: `eq.${slug}`,
      select: 'id,author_name,content,created_at',
      order: 'created_at.asc',
      limit: '500',
    });
    const res = await fetch(`${config.url}/rest/v1/comments?${params}`, {
      headers: { apikey: config.key, Authorization: `Bearer ${config.key}` },
    });

    if (res.ok) return { ok: true, comments: (await res.json()) as Comment[] };

    console.error('Comments: Supabase returned', res.status, await res.text());
    return { ok: false, error: 'server_error' };
  } catch (err) {
    console.error('Comments: request to Supabase failed', err);
    return { ok: false, error: 'server_error' };
  }
}
