-- Run this once in the Supabase SQL editor (Project → SQL Editor → New query)
-- for the project used by SUPABASE_URL / SUPABASE_ANON_KEY.
--
-- `confirmed` is reserved for a future double opt-in step and is always
-- `false` for now - src/pages/api/subscribe.ts doesn't set it.

create table newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz default now(),
  source text default 'website',
  confirmed boolean default false
);

-- New tables have Row Level Security off by default, which is what lets the
-- public anon key insert from src/pages/api/subscribe.ts. If you later
-- enable RLS on this table, add an insert policy for the anon role or the
-- signup form will start failing with a permissions error.

-- Comments on blog posts. `post_slug` matches a post's `slug` frontmatter
-- field (src/content.config.ts), not the URL path. There is no moderation
-- panel - src/pages/api/comments.ts writes and reads this table directly,
-- so a comment is visible as soon as it's submitted (spam is filtered only
-- by the honeypot field in the form, same as the newsletter signup).
create table comments (
  id uuid primary key default gen_random_uuid(),
  post_slug text not null,
  author_name text not null,
  content text not null,
  created_at timestamptz default now()
);

create index comments_post_slug_idx on comments (post_slug, created_at);

-- Same RLS note as above: off by default, which is what lets the anon key
-- both insert and select from src/pages/api/comments.ts.
