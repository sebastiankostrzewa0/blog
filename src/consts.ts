// Central place for site-wide constants used across layouts, SEO tags and feeds.
export const SITE_TITLE = 'Sebastian Kostrzewa';
export const SITE_TAGLINE = 'Nieruchomości bez lukru';
export const SITE_DESCRIPTION =
  'Blog Sebastiana Kostrzewy — o rynku nieruchomości, prawie, danych i designie, widzianym od środka branży, nie z prezentacji dla zarządu.';
export const SITE_LOCALE = 'pl-PL';
export const SITE_AUTHOR = 'Sebastian';

// TODO: podmień RAISLY_URL na docelowy adres przed publikacją.
export const RAISLY_URL = 'https://raisly.pl';
export const LINKEDIN_URL = 'https://www.linkedin.com/in/sebastian-kostrzewa-33b705260/?skipRedirect=true';
export const CONTACT_EMAIL = 'sebastiankostrzewa0@gmail.com';

export const NAV_LINKS = [
  { href: '/blog/', label: 'Blog' },
  { href: '/o-mnie/', label: 'O mnie' },
  { href: '/kontakt/', label: 'Kontakt' },
] as const;
