-- npm run db:test   (needs the local stack: npm run db:start)
-- Proves people can only touch their own synced rows, and that private keys are refused.
begin;
create extension if not exists pgtap with schema extensions;
select plan(13);

insert into auth.users (id, email, aud, role)
values ('00000000-0000-0000-0000-00000000000a', 'a@test.local', 'authenticated', 'authenticated'),
       ('00000000-0000-0000-0000-00000000000b', 'b@test.local', 'authenticated', 'authenticated');

select ok((select relrowsecurity from pg_class where oid = 'public.user_state'::regclass), 'row level security is on');

-- ── as A ──
set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated"}';

select lives_ok($$ insert into public.user_state (key, value) values ('progress', '{"xp": 120}') $$, 'A can save their progress (user_id filled in)');
select is((select user_id from public.user_state where key = 'progress'), '00000000-0000-0000-0000-00000000000a'::uuid, 'the row belongs to A');
select throws_ok($$ insert into public.user_state (key, value) values ('tool:period', '{}') $$, '23514', null, 'private keys like the cycle tracker are refused');
select throws_ok($$ insert into public.user_state (key, value) values ('journal', '"dear diary"') $$, '23514', null, 'the journal is refused');
select throws_ok(
  $$ insert into public.user_state (user_id, key, value) values ('00000000-0000-0000-0000-00000000000b', 'shelf', '[]') $$,
  '42501', null, 'A cannot write a row as B');
select ok((select updated_at from public.user_state where key = 'progress') is not null, 'the server stamps the time');

-- ── as B ──
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000000b","role":"authenticated"}';
select is((select count(*) from public.user_state)::int, 0, 'B sees none of A''s rows');
update public.user_state set value = '{"xp": 0}' where user_id = '00000000-0000-0000-0000-00000000000a';
delete from public.user_state where user_id = '00000000-0000-0000-0000-00000000000a';

-- ── logged out ──
set local role anon;
set local request.jwt.claims = '{"role":"anon"}';
select throws_ok($$ select * from public.user_state $$, '42501', null, 'logged-out visitors cannot read the table at all');
select throws_ok($$ select public.delete_account() $$, '42501', null, 'logged-out visitors cannot call delete_account');

-- ── back as A: B's update and delete did nothing ──
set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated"}';
select is((select value from public.user_state where key = 'progress'), '{"xp": 120}'::jsonb, 'B could not change or delete A''s row');

select lives_ok($$ select public.delete_account() $$, 'A can delete their own account');
reset role;
select is(
  (select count(*) from auth.users where id = '00000000-0000-0000-0000-00000000000a')::int
    + (select count(*) from public.user_state where user_id = '00000000-0000-0000-0000-00000000000a')::int,
  0, 'the login and every synced row are gone');

select * from finish();
rollback;
