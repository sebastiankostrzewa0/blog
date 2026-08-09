// Talks to Supabase's REST API (PostgREST) directly over fetch instead of
// pulling in @supabase/supabase-js - the only operation needed here is a
// single insert, so a client library would be dead weight.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: unknown): value is string {
  return typeof value === 'string' && value.length <= 254 && EMAIL_RE.test(value);
}

export type SubscribeResult =
  | { ok: true; alreadySubscribed: boolean }
  | { ok: false; error: 'not_configured' | 'server_error' };

export async function addSubscriber(email: string): Promise<SubscribeResult> {
  const url = import.meta.env.SUPABASE_URL;
  const key = import.meta.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error('Newsletter signup: SUPABASE_URL / SUPABASE_ANON_KEY are not set.');
    return { ok: false, error: 'not_configured' };
  }

  try {
    const res = await fetch(`${url}/rest/v1/newsletter_subscribers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: key,
        Authorization: `Bearer ${key}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ email, source: 'website', confirmed: false }),
    });

    // PostgREST maps the table's `unique` constraint on `email` to 409 -
    // that's "already on the list", not a failure.
    if (res.status === 409) return { ok: true, alreadySubscribed: true };
    if (res.ok) return { ok: true, alreadySubscribed: false };

    console.error('Newsletter signup: Supabase returned', res.status, await res.text());
    return { ok: false, error: 'server_error' };
  } catch (err) {
    console.error('Newsletter signup: request to Supabase failed', err);
    return { ok: false, error: 'server_error' };
  }
}
