import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

// TODO: replace with your production domain before deploying.
export const SITE_URL = 'https://blog.example.com';

export default defineConfig({
  site: SITE_URL,
  // Almost the whole site is still prerendered at build time. The Vercel
  // adapter only exists so `src/pages/api/subscribe.ts` can run on demand
  // (it needs to call Supabase at request time) - that one route opts in
  // with `export const prerender = false`, everything else stays static.
  output: 'static',
  adapter: vercel(),
  integrations: [sitemap()],
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
  },
  build: {
    format: 'directory',
  },
});
