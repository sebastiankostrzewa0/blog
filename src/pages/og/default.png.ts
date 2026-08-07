import type { APIRoute } from 'astro';
import { generateOgImage } from '@/lib/og';
import { SITE_TAGLINE } from '@/consts';

export const GET: APIRoute = async () => {
  const png = await generateOgImage({ title: SITE_TAGLINE });
  return new Response(Buffer.from(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
