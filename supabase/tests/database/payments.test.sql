-- npm run db:test   (needs the local stack: npm run db:start)
-- Proves people can only add their own pending payments, can't grant themselves Plus,
-- and that verifying a payment is what turns Plus on.
begin;
create extension if not exists pgtap with schema extensions;
select plan(17);

insert into auth.users (id, email, aud, role)
values ('00000000-0000-0000-0000-0000000000a1', 'a@pay.local', 'authenticated', 'authenticated'),
       ('00000000-0000-0000-0000-0000000000b1', 'b@pay.local', 'authenticated', 'authenticated');

-- ── as A ──
set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}';

select lives_ok($$ insert into public.payments (plan, amount, utr) values ('yearly', 399, '123456789012') $$, 'A can send a payment reference');
select is((select status from public.payments where utr = '123456789012'), 'pending', 'it starts pending');
select throws_ok($$ insert into public.payments (plan, amount, utr) values ('yearly', 1, '123456789013') $$, '23514', null, 'the amount has to match the plan');
select throws_ok($$ insert into public.payments (plan, amount, utr) values ('monthly', 49, 'not-a-utr') $$, '23514', null, 'the reference has to be 12 digits');
select throws_ok($$ insert into public.payments (plan, amount, utr) values ('monthly', 49, '123456789012') $$, '23505', null, 'the same reference cannot be used twice');
select throws_ok($$ insert into public.payments (plan, amount, utr, status) values ('monthly', 49, '123456789014', 'verified') $$, '42501', null, 'A cannot mark their own payment verified');
select throws_ok($$ update public.payments set status = 'verified' where utr = '123456789012' $$, '42501', null, 'A cannot verify by updating either');
select throws_ok($$ insert into public.memberships (user_id, plan, until) values ('00000000-0000-0000-0000-0000000000a1', 'yearly', now() + interval '1 year') $$, '42501', null, 'A cannot grant themselves Plus');
select throws_ok($$ select public.verify_payment('123456789012') $$, '42501', null, 'A cannot call verify_payment');

select lives_ok($$ insert into public.payments (plan, amount, utr) values ('monthly', 49, '200000000001'), ('monthly', 49, '200000000002'), ('monthly', 49, '200000000003'), ('monthly', 49, '200000000004') $$, 'A can have a few waiting');
select throws_ok($$ insert into public.payments (plan, amount, utr) values ('monthly', 49, '200000000005') $$, '53400', null, 'but not more than 5 at once');

-- ── as B ──
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000b1","role":"authenticated"}';
select is((select count(*) from public.payments)::int, 0, 'B sees none of A''s payments');

-- ── logged out ──
set local role anon;
set local request.jwt.claims = '{"role":"anon"}';
select throws_ok($$ select * from public.payments $$, '42501', null, 'logged-out visitors cannot read payments');

-- ── you, the owner, verify ──
reset role;
select ok((select public.verify_payment('123456789012')) > now() + interval '365 days', 'verifying a yearly payment gives about a year of Plus');
select is((select status from public.payments where utr = '123456789012'), 'verified', 'the payment is marked verified');

set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}';
select is((select count(*) from public.memberships)::int, 1, 'A can now see their membership');

reset role;
select throws_ok($$ select public.verify_payment('123456789012') $$, 'P0001', null, 'a payment can only be verified once');

select * from finish();
