import type { APIRoute } from 'astro';
import { addSubscriber, isValidEmail } from '@/lib/newsletter';

// Only this route needs on-demand rendering (it has to call Supabase per
// request) - the rest of the site stays fully static.
export const prerender = false;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

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

  const { email, consent, website } = body as Record<string, unknown>;

  // Honeypot: a field real visitors never see or fill in. A bot that fills
  // every input trips it - reject silently with a fake success so it has no
  // signal to learn from, and don't touch the database.
  if (typeof website === 'string' && website.trim() !== '') {
    return json({ ok: true, status: 'subscribed' });
  }

  if (!isValidEmail(email)) {
    return json({ ok: false, error: 'invalid_email' }, 400);
  }

  if (consent !== true) {
    return json({ ok: false, error: 'missing_consent' }, 400);
  }

  const result = await addSubscriber(email.trim().toLowerCase());
  if (!result.ok) {
    return json({ ok: false, error: result.error }, 502);
  }

  return json({
    ok: true,
    status: result.alreadySubscribed ? 'already_subscribed' : 'subscribed',
  });
};
