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
