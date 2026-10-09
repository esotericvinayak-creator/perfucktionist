-- How many people use each tool, so tool pages can say "N people have used this".
-- Only counts, never who. `tool_usage` is public to read; the counters move only through
-- track_tool(), which signed-in people call when they open a tool. It only touches the rows seeded
-- below, so nobody can invent tool names. A new tool needs its id added in a new migration.

create table public.tool_usage (
  tool_id text   primary key check (tool_id ~ '^[a-z0-9-]{2,40}$'),
  opens   bigint not null default 0,
  people  bigint not null default 0
);

comment on table public.tool_usage is 'Opens and distinct signed-in people per tool. Aggregate only; no personal data.';

-- Who has opened what, so a person counts once. Nobody can read this table: the function writes it.
create table public.tool_people (
  user_id uuid not null references auth.users (id) on delete cascade,
  tool_id text not null references public.tool_usage (tool_id) on delete cascade,
  primary key (user_id, tool_id)
);

alter table public.tool_usage enable row level security;
alter table public.tool_people enable row level security;

create policy "anyone can read tool counts" on public.tool_usage for select to anon, authenticated using (true);

revoke all on public.tool_usage from anon, authenticated;
revoke all on public.tool_people from anon, authenticated;
grant select on public.tool_usage to anon, authenticated;

create function public.track_tool(p_tool text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := auth.uid();
  added integer;
begin
  if me is null then
    return;
  end if;
  update public.tool_usage set opens = opens + 1 where tool_id = p_tool;
  if not found then
    return;
  end if;
  insert into public.tool_people (user_id, tool_id) values (me, p_tool) on conflict do nothing;
  get diagnostics added = row_count;
  if added > 0 then
    update public.tool_usage set people = people + 1 where tool_id = p_tool;
  end if;
end;
$$;

revoke all on function public.track_tool(text) from public, anon;
grant execute on function public.track_tool(text) to authenticated;

insert into public.tool_usage (tool_id) values
  ('checkin'),
  ('panic'),
  ('safety-plan'),
  ('worry-box'),
  ('journal'),
  ('bad-day'),
  ('affirm'),
  ('sounds'),
  ('focus'),
  ('brain-dump'),
  ('done-list'),
  ('starter'),
  ('countdowns'),
  ('flashcards'),
  ('timetable'),
  ('eye-care'),
  ('phone-down'),
  ('screen-time'),
  ('workout'),
  ('water'),
  ('sleep-calc'),
  ('period'),
  ('expenses'),
  ('budget'),
  ('split'),
  ('sip'),
  ('salary'),
  ('worth-it'),
  ('roi'),
  ('maths'),
  ('safe-walk'),
  ('ice'),
  ('privacy'),
  ('breakup'),
  ('friends'),
  ('kindness'),
  ('convo'),
  ('habits'),
  ('quit'),
  ('capsule'),
  ('bucket'),
  ('wallpaper'),
  ('interview'),
  ('speak')
on conflict do nothing;
