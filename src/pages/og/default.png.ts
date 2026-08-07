import type { APIRoute } from 'astro';
import { generateOgImage } from '@/lib/og';
import { SITE_TITLE } from '@/consts';

export const GET: APIRoute = async () => {
  const png = await generateOgImage({ title: 'Pismo o dobrym rzemiośle', eyebrow: SITE_TITLE });
  return new Response(Buffer.from(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
