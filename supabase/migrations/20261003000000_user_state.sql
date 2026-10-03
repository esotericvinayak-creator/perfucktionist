-- What follows a person between devices: streak and XP, saved books, liked songs,
-- practice scores and a few preferences. One row per (person, key), value is JSON.
--
-- Journal, cycle tracker, money, check-ins and every other tool stay on the phone.
-- The app never sends them, and the key check below refuses anything not on the list.

create table public.user_state (
  user_id    uuid        not null default auth.uid() references auth.users (id) on delete cascade,
  key        text        not null,
  value      jsonb       not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, key),
  constraint user_state_key_allowed check (key in ('progress', 'shelf', 'liked', 'practice', 'theme', 'reader-lang', 'school-class', 'school-lang', 'tool-pins')),
  constraint user_state_value_size check (pg_column_size(value) <= 512 * 1024)
);

comment on table public.user_state is 'Synced app state per person. Private data (journal, cycle, money, tools) is never stored here.';

-- The server decides the time, so devices with wrong clocks can't win or lose a sync.
create function public.user_state_touch()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger user_state_touch
before insert or update on public.user_state
for each row execute function public.user_state_touch();

-- Row level security: you can only ever see or change your own rows.
alter table public.user_state enable row level security;

create policy "read own state" on public.user_state
  for select to authenticated using ((select auth.uid()) = user_id);

create policy "add own state" on public.user_state
  for insert to authenticated with check ((select auth.uid()) = user_id);

create policy "change own state" on public.user_state
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "remove own state" on public.user_state
  for delete to authenticated using ((select auth.uid()) = user_id);

-- Logged-out visitors get nothing, not even an empty table.
revoke all on public.user_state from anon;
grant select, insert, update, delete on public.user_state to authenticated;

-- "Delete my account": removes the login and, through the cascade, every synced row.
-- Runs as the table owner because people can't delete from auth.users themselves;
-- it only ever touches the caller's own id.
create function public.delete_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := auth.uid();
begin
  if me is null then
    raise exception 'not signed in' using errcode = '42501';
  end if;
  delete from auth.users where id = me;
end;
$$;

revoke all on function public.delete_account() from public, anon;
grant execute on function public.delete_account() to authenticated;
