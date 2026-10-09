-- Real Faith polls: one Yes/No answer per person per statement.
--
-- The statements live in the app (src/data/faithPolls.ts); they are about practices, claims and
-- red flags, never about named people or organisations. This table only stores the answers.
-- Nobody can read anyone else's row. The app shows totals through faith_tally(), which returns
-- counts only, never who answered.

create table public.faith_votes (
  user_id      uuid        not null default auth.uid() references auth.users (id) on delete cascade,
  statement_id text        not null,
  answer       boolean     not null,
  updated_at   timestamptz not null default now(),
  primary key (user_id, statement_id),
  constraint faith_votes_statement_id_shape check (statement_id ~ '^[a-z0-9-]{3,40}$')
);

comment on table public.faith_votes is 'Anonymous-in-the-UI Yes/No answers to curated Real Faith statements. Own rows only; totals come from faith_tally().';
comment on column public.faith_votes.answer is 'true = Yes, false = No.';

-- The server decides the time, so devices with wrong clocks can't skew anything.
create function public.faith_votes_touch()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger faith_votes_touch
before insert or update on public.faith_votes
for each row execute function public.faith_votes_touch();

-- Row level security: you can only ever see or change your own answers.
alter table public.faith_votes enable row level security;

create policy "read own faith votes" on public.faith_votes
  for select to authenticated using ((select auth.uid()) = user_id);

create policy "add own faith votes" on public.faith_votes
  for insert to authenticated with check ((select auth.uid()) = user_id);

create policy "change own faith votes" on public.faith_votes
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "remove own faith votes" on public.faith_votes
  for delete to authenticated using ((select auth.uid()) = user_id);

-- Logged-out visitors get nothing, not even an empty table.
revoke all on public.faith_votes from anon;
grant select, insert, update, delete on public.faith_votes to authenticated;

-- Totals for every statement. Runs as the table owner so it can count rows that RLS hides from
-- the caller; it only ever returns numbers, never user ids.
create function public.faith_tally()
returns table (statement_id text, yes bigint, no bigint)
language sql
stable
security definer
set search_path = ''
as $$
  select v.statement_id,
         count(*) filter (where v.answer),
         count(*) filter (where not v.answer)
  from public.faith_votes v
  group by v.statement_id;
$$;

comment on function public.faith_tally() is 'Yes / No counts per statement across everyone. Counts only; never returns who answered.';

revoke all on function public.faith_tally() from public, anon;
grant execute on function public.faith_tally() to authenticated;

-- "Delete my account" (user_state migration) deletes from auth.users, and the cascade above
-- removes this person's answers with it. Nothing else to do.
