// Central place for site-wide constants used across layouts, SEO tags and feeds.
export const SITE_TITLE = 'Sebastian Kostrzewa';
export const SITE_TAGLINE = 'Nieruchomości, PropTech i budowanie firmy';
export const SITE_DESCRIPTION =
  'Blog Sebastiana Kostrzewy, foundera Raisly — o nieruchomościach, PropTech, ContTech, architekturze i budowaniu firmy deweloperskiej/budowlanej.';
export const SITE_LOCALE = 'pl-PL';
export const SITE_AUTHOR = 'Sebastian';

// TODO: podmień na docelowe adresy przed publikacją.
export const RAISLY_URL = 'https://raisly.pl';
export const LINKEDIN_URL = 'https://www.linkedin.com/in/sebastiankostrzewa';

export const NAV_LINKS = [
  { href: '/nieruchomosci/', label: 'Nieruchomości' },
  { href: '/architektura/', label: 'Architektura' },
  { href: '/biznes/', label: 'Biznes' },
  { href: '/proptech/', label: 'PropTech' },
  { href: '/conttech/', label: 'ContTech' },
  { href: '/o-mnie/', label: 'O mnie' },
] as const;
