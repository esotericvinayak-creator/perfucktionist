-- npm run db:test   (needs the local stack: npm run db:start)
-- Proves Real Faith answers are private to their owner, can be changed, and that the totals
-- are correct and only available to signed-in people.
begin;
create extension if not exists pgtap with schema extensions;
select plan(22);

insert into auth.users (id, email, aud, role)
values ('00000000-0000-0000-0000-0000000000f1', 'a@faith.local', 'authenticated', 'authenticated'),
       ('00000000-0000-0000-0000-0000000000f2', 'b@faith.local', 'authenticated', 'authenticated'),
       ('00000000-0000-0000-0000-0000000000f3', 'c@faith.local', 'authenticated', 'authenticated');

select ok((select relrowsecurity from pg_class where oid = 'public.faith_votes'::regclass), 'row level security is on');

-- ── as A ──
set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000f1","role":"authenticated"}';

select lives_ok($$ insert into public.faith_votes (statement_id, answer) values ('pay-to-remove-curse', true) $$, 'A can answer (user_id filled in)');
select is((select user_id from public.faith_votes where statement_id = 'pay-to-remove-curse'), '00000000-0000-0000-0000-0000000000f1'::uuid, 'the answer belongs to A');
select ok((select updated_at from public.faith_votes where statement_id = 'pay-to-remove-curse') is not null, 'the server stamps the time');
select lives_ok($$ insert into public.faith_votes (statement_id, answer) values ('prayer-calms-me', true) $$, 'A answers a second statement');
select throws_ok($$ insert into public.faith_votes (statement_id, answer) values ('pay-to-remove-curse', false) $$, '23505', null, 'a second insert for the same statement is refused (change it instead)');
select lives_ok($$ update public.faith_votes set answer = false where statement_id = 'pay-to-remove-curse' $$, 'A can change an answer');
select is((select answer from public.faith_votes where statement_id = 'pay-to-remove-curse'), false, 'the change stuck');
select throws_ok($$ insert into public.faith_votes (statement_id, answer) values ('Bad ID!', true) $$, '23514', null, 'a badly shaped statement id is refused');
select throws_ok($$ insert into public.faith_votes (statement_id, answer) values ('ab', true) $$, '23514', null, 'a too-short statement id is refused');
select throws_ok(
  $$ insert into public.faith_votes (user_id, statement_id, answer) values ('00000000-0000-0000-0000-0000000000f2', 'prayer-calms-me', true) $$,
  '42501', null, 'A cannot answer as B');

-- ── as B ──
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000f2","role":"authenticated"}';
select is((select count(*) from public.faith_votes)::int, 0, 'B sees none of A''s answers');
insert into public.faith_votes (statement_id, answer) values ('pay-to-remove-curse', true), ('prayer-calms-me', false);
update public.faith_votes set answer = true where user_id = '00000000-0000-0000-0000-0000000000f1';
delete from public.faith_votes where user_id = '00000000-0000-0000-0000-0000000000f1';

-- ── as C ──
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000f3","role":"authenticated"}';
insert into public.faith_votes (statement_id, answer) values ('pay-to-remove-curse', true), ('prayer-calms-me', true);

-- tally: pay-to-remove-curse = A no, B yes, C yes; prayer-calms-me = A yes, B no, C yes
select is(
  (select row(yes, no)::text from public.faith_tally() where statement_id = 'pay-to-remove-curse'),
  '(2,1)', 'the tally counts everyone''s answers for a statement (2 yes, 1 no)');
select is(
  (select row(yes, no)::text from public.faith_tally() where statement_id = 'prayer-calms-me'),
  '(2,1)', 'and for another statement');
select is((select count(*) from public.faith_tally())::int, 2, 'one tally row per statement');
select is((select count(*) from information_schema.columns where table_name = 'faith_tally' and column_name like '%user%')::int, 0, 'the tally has no user column');

-- ── back as A: B's update and delete did nothing ──
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000f1","role":"authenticated"}';
select is((select count(*) from public.faith_votes where answer = false and statement_id = 'pay-to-remove-curse')::int, 1, 'B could not change or delete A''s answer');

-- ── logged out ──
set local role anon;
set local request.jwt.claims = '{"role":"anon"}';
select throws_ok($$ select * from public.faith_votes $$, '42501', null, 'logged-out visitors cannot read answers');
select throws_ok($$ insert into public.faith_votes (user_id, statement_id, answer) values ('00000000-0000-0000-0000-0000000000f1', 'prayer-calms-me', true) $$, '42501', null, 'logged-out visitors cannot answer');
select throws_ok($$ select * from public.faith_tally() $$, '42501', null, 'logged-out visitors cannot read the tally');

-- ── deleting an account removes its answers ──
set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000f2","role":"authenticated"}';
select lives_ok($$ select public.delete_account() $$, 'B can delete their own account');
reset role;
select is(
  (select count(*) from auth.users where id = '00000000-0000-0000-0000-0000000000f2')::int
    + (select count(*) from public.faith_votes where user_id = '00000000-0000-0000-0000-0000000000f2')::int,
  0, 'the login and every answer are gone');

select * from finish();
rollback;
