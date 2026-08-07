import type { APIRoute } from 'astro';

// Derives the sitemap URL from Astro.site so it always matches astro.config.mjs
// instead of drifting from a hardcoded copy in public/.
export const GET: APIRoute = ({ site }) => {
  const sitemapUrl = new URL('sitemap-index.xml', site).toString();
  const body = `User-agent: *\nAllow: /\n\nSitemap: ${sitemapUrl}\n`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
