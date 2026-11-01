-- npm run db:test   (needs the local stack: npm run db:start)
-- Proves family details can't be read from a browser, that sign-ups only go one way, and that
-- the database refuses a call plan nobody should be able to make.
begin;
create extension if not exists pgtap with schema extensions;
select plan(21);

select ok((select relrowsecurity from pg_class where oid = 'public.call_families'::regclass), 'row level security is on for families');
select ok((select relrowsecurity from pg_class where oid = 'public.call_attempts'::regclass), 'row level security is on for calls');
select ok((select relrowsecurity from pg_class where oid = 'public.call_signups'::regclass), 'row level security is on for sign-ups');

insert into public.call_families (id, child_name, child_phone, parent_name, parent_phone)
values ('00000000-0000-0000-0000-00000000c001', 'Neha', '+14155550100', 'Papa', '+919876543210');

select is((select parent_consent_at from public.call_families limit 1), null, 'a new family has no consent until someone records it');

-- ── as someone visiting the website ──
set local role anon;
select throws_ok($$ select * from public.call_families $$, '42501', null, 'a visitor cannot read families');
select throws_ok($$ select * from public.call_attempts $$, '42501', null, 'a visitor cannot read calls');
select throws_ok($$ select * from public.call_signups $$, '42501', null, 'a visitor cannot read sign-ups');
select throws_ok($$ update public.call_families set parent_consent_at = now(), consent_note = 'x' $$, '42501', null, 'a visitor cannot grant consent');
select lives_ok($$ insert into public.call_signups (name, phone, parent_city, lives) values ('Neha', '+91 98765 43210', 'Lucknow', 'abroad') $$, 'a visitor can sign up');
select throws_ok($$ insert into public.call_signups (name, phone) values ('Neha', 'call me maybe') $$, '23514', null, 'a nonsense number is refused');
select throws_ok($$ insert into public.call_signups (name, phone) values ('   ', '+919876543210') $$, '23514', null, 'a blank name is refused');
select throws_ok($$ insert into public.call_signups (id, name, phone) values (gen_random_uuid(), 'Neha', '+919876543210') $$, '42501', null, 'a visitor can only fill in the form fields');

-- ── as a signed-in person: no more than a visitor ──
set local role authenticated;
select throws_ok($$ select * from public.call_families $$, '42501', null, 'an account cannot read families');
select throws_ok($$ select * from public.call_attempts $$, '42501', null, 'an account cannot read calls');

reset role;

select throws_ok($$ update public.call_families set parent_consent_at = now() $$, '23514', null, 'consent needs a note of how it was given');
select throws_ok($$ update public.call_families set call_time = '07:30' $$, '23514', null, 'no calls before 9am');
select throws_ok($$ update public.call_families set call_time = '21:00' $$, '23514', null, 'no calls after 8pm');
select throws_ok($$ update public.call_families set parent_phone = '9876543210' $$, '23514', null, 'a parent’s number needs +91');
select throws_ok($$ update public.call_families set call_days = '{}' $$, '23514', null, 'a plan needs at least one day');

insert into public.call_attempts (family_id, call_date, kind, attempt)
values ('00000000-0000-0000-0000-00000000c001', '2026-11-02', 'daily', 1);
select throws_ok(
  $$ insert into public.call_attempts (family_id, call_date, kind, attempt) values ('00000000-0000-0000-0000-00000000c001', '2026-11-02', 'daily', 1) $$,
  '23505', null, 'two runs cannot place the same call');

delete from public.call_families;
select is((select count(*) from public.call_attempts), 0::bigint, 'forgetting a family removes its calls');

select * from finish();
rollback;
