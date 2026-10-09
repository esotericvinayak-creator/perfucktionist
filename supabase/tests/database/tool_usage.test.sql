-- npm run db:test   (needs the local stack: npm run db:start)
-- Proves tool counts can be read by anyone, only move through track_tool(), count a person once,
-- and ignore tool names that aren't seeded.
begin;
create extension if not exists pgtap with schema extensions;
select plan(10);

insert into auth.users (id, email, aud, role)
values ('00000000-0000-0000-0000-0000000000c1', 'c@tool.local', 'authenticated', 'authenticated'),
       ('00000000-0000-0000-0000-0000000000d1', 'd@tool.local', 'authenticated', 'authenticated');

-- ── logged out: can read counts, can't write ──
set local role anon;
set local request.jwt.claims = '{"role":"anon"}';
select lives_ok($$ select * from public.tool_usage $$, 'anyone can read the counts');
select throws_ok($$ update public.tool_usage set opens = 999 where tool_id = 'journal' $$, '42501', null, 'nobody can edit the counts directly');
select throws_ok($$ select public.track_tool('journal') $$, '42501', null, 'logged-out visitors cannot track');
select throws_ok($$ select * from public.tool_people $$, '42501', null, 'the list of who opened what is closed');

-- ── as C ──
set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000c1","role":"authenticated"}';
select lives_ok($$ select public.track_tool('journal') $$, 'C opens the journal');
select lives_ok($$ select public.track_tool('journal') $$, 'C opens the journal again');
select lives_ok($$ select public.track_tool('not-a-real-tool') $$, 'an unknown tool is ignored, not an error');

-- ── as D ──
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000d1","role":"authenticated"}';
select lives_ok($$ select public.track_tool('journal') $$, 'D opens the journal');

select is((select opens from public.tool_usage where tool_id = 'journal'), 3::bigint, 'three opens in total');
select is((select people from public.tool_usage where tool_id = 'journal'), 2::bigint, 'but two people');

select * from finish();
