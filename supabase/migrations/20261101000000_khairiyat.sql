-- Khairiyat: a short daily AI call to someone's parent, and a note to their child. A paid test, run by hand.
--
--   call_families   who to call, when, and proof that the parent said yes
--   call_attempts   every call placed, what happened, and the note it produced
--   call_signups    people who asked to join from the website
--
-- The first two hold private family details, so no browser can read them. Only the server can:
-- the edge functions use the service role and `npm run calls` uses the database owner.
-- See docs/KHAIRIYAT.md.

create table public.call_families (
  id                uuid        primary key default gen_random_uuid(),
  child_name        text        not null,
  child_phone       text        not null,
  parent_name       text        not null,
  parent_phone      text        not null unique,
  language          text        not null default 'Hindi' check (language in ('Hindi', 'English')),
  call_time         time        not null default '10:30',
  call_days         smallint[]  not null default '{0,1,2,3,4,5,6}',
  talk_about        text        not null default '',
  medicines         text        not null default '',
  parent_consent_at timestamptz,
  consent_note      text        not null default '',
  status            text        not null default 'active' check (status in ('active', 'paused', 'stopped')),
  paid_until        date,
  months_paid       integer     not null default 0 check (months_paid >= 0),
  created_at        timestamptz not null default now(),
  constraint call_families_child_phone check (child_phone ~ '^\+[1-9][0-9]{9,14}$'),
  constraint call_families_parent_phone check (parent_phone ~ '^\+91[6-9][0-9]{9}$'),
  constraint call_families_hours check (call_time between '09:00' and '20:00'),
  constraint call_families_days check (cardinality(call_days) > 0 and call_days <@ '{0,1,2,3,4,5,6}'::smallint[]),
  -- A parent's yes always comes with a note of how it was given.
  constraint call_families_consent check (parent_consent_at is null or length(btrim(consent_note)) > 0)
);

comment on table public.call_families is 'Khairiyat families. Nobody is called until parent_consent_at is set.';

create table public.call_attempts (
  id              uuid        primary key default gen_random_uuid(),
  family_id       uuid        not null references public.call_families (id) on delete cascade,
  call_date       date        not null,
  kind            text        not null check (kind in ('daily', 'alert')),
  attempt         smallint    not null check (attempt between 1 and 20),
  status          text        not null default 'dialing' check (status in ('dialing', 'connected', 'no_answer', 'busy', 'failed')),
  sarvam_id       text,
  seconds         numeric,
  parent_spoke    boolean     not null default false,
  failure_reason  text,
  transcript      jsonb,
  note            text,
  reason_to_call  text,
  medicine_status text        check (medicine_status in ('taken', 'not_taken', 'not_discussed')),
  urgent          text,
  created_at      timestamptz not null default now(),
  finished_at     timestamptz,
  -- Two overlapping runs of the dialler can't both ring someone: the second insert fails here.
  constraint call_attempts_once unique (family_id, call_date, kind, attempt)
);

comment on table public.call_attempts is 'One row per call placed. call_date is the day in India. Transcripts are cleared after 30 days by the dialler.';

create index call_attempts_recent on public.call_attempts (family_id, created_at desc);

alter table public.call_families enable row level security;
alter table public.call_attempts enable row level security;
revoke all on public.call_families from anon, authenticated;
revoke all on public.call_attempts from anon, authenticated;

-- The website's sign-up form. Anyone can add a row. Nobody can read one back from a browser.
create table public.call_signups (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null check (length(btrim(name)) between 1 and 80),
  phone       text        not null check (phone ~ '^\+?[0-9][0-9 ()-]{7,19}$'),
  parent_city text        not null default '' check (length(parent_city) <= 80),
  lives       text        not null default 'india' check (lives in ('india', 'abroad')),
  created_at  timestamptz not null default now()
);

comment on table public.call_signups is 'People who asked to join the Khairiyat test. Read them with `npm run calls -- signups`.';

alter table public.call_signups enable row level security;
revoke all on public.call_signups from anon, authenticated;
grant insert (name, phone, parent_city, lives) on public.call_signups to anon, authenticated;

create policy "anyone can sign up" on public.call_signups
  for insert to anon, authenticated
  with check (true);

-- No more than 30 sign-ups an hour, which stops a script filling the table. A definer function,
-- because the people signing up can't read the table to count it.
create function public.call_signups_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select count(*) from public.call_signups where created_at > now() - interval '1 hour') >= 30 then
    raise exception 'too many sign-ups, try again later' using errcode = '53400';
  end if;
  return new;
end;
$$;

revoke all on function public.call_signups_limit() from public, anon, authenticated;

create trigger call_signups_limit
before insert on public.call_signups
for each row execute function public.call_signups_limit();

-- What rings the dialler every 5 minutes. The job itself holds a secret, so `npm run calls:deploy`
-- creates it, rather than this file.
create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;
