-- Plus, paid by UPI. Nothing here talks to a payment provider.
--   1. A person pays the UPI ID shown in the app and sends the 12-digit reference (UTR) from their receipt.
--   2. That lands in `payments` as 'pending'.
--   3. You compare it with your own PhonePe history (same reference, same amount), then run
--      `npm run pay -- verify <reference>`. That marks it verified and gives them Plus in `memberships`.
-- People can add and read their own payments. Only the database owner can verify one or grant Plus,
-- so nobody can unlock Plus by editing their own rows.
--
-- Prices live here too (49 and 399), so a changed price needs a new migration and a new build.

create table public.payments (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null default auth.uid() references auth.users (id) on delete cascade,
  plan       text        not null check (plan in ('monthly', 'yearly')),
  amount     integer     not null,
  utr        text        not null,
  status     text        not null default 'pending' check (status in ('pending', 'verified', 'rejected')),
  created_at timestamptz not null default now(),
  constraint payments_price check ((plan = 'monthly' and amount = 49) or (plan = 'yearly' and amount = 399)),
  constraint payments_utr_format check (utr ~ '^[0-9]{12}$'),
  constraint payments_utr_unique unique (utr)
);

comment on table public.payments is 'UPI payments people say they made for Plus. Pending until you verify the UTR against your own payment history.';

alter table public.payments enable row level security;

create policy "read own payments" on public.payments
  for select to authenticated using ((select auth.uid()) = user_id);

-- Add one for yourself, and only as pending.
create policy "add own pending payment" on public.payments
  for insert to authenticated
  with check ((select auth.uid()) = user_id and status = 'pending');

-- No more than 5 waiting at a time (stops spam). A trigger, because a policy can't query its own table.
create function public.payments_limit()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select count(*) from public.payments where user_id = new.user_id and status = 'pending') >= 5 then
    raise exception 'too many payments waiting to be checked' using errcode = '53400';
  end if;
  return new;
end;
$$;

create trigger payments_limit
before insert on public.payments
for each row execute function public.payments_limit();

revoke all on public.payments from anon;
revoke all on public.payments from authenticated;
grant select, insert (plan, amount, utr) on public.payments to authenticated;

-- Who has Plus until when. Read-only for people; written only by verify_payment().
create table public.memberships (
  user_id    uuid        primary key references auth.users (id) on delete cascade,
  plan       text        not null check (plan in ('monthly', 'yearly')),
  until      timestamptz not null,
  updated_at timestamptz not null default now()
);

alter table public.memberships enable row level security;

create policy "read own membership" on public.memberships
  for select to authenticated using ((select auth.uid()) = user_id);

revoke all on public.memberships from anon;
revoke all on public.memberships from authenticated;
grant select on public.memberships to authenticated;

-- You run these (from the dashboard SQL editor or `npm run pay`). People can't call them.
create function public.verify_payment(p_utr text)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  pay public.payments;
  base timestamptz;
  new_until timestamptz;
begin
  update public.payments set status = 'verified' where utr = p_utr and status = 'pending' returning * into pay;
  if not found then
    raise exception 'no pending payment with reference %', p_utr;
  end if;
  -- Paying early adds to what's left instead of overwriting it.
  select greatest(coalesce(m.until, now()), now()) into base from (select 1) x left join public.memberships m on m.user_id = pay.user_id;
  new_until := base + case pay.plan when 'yearly' then interval '366 days' else interval '31 days' end;
  insert into public.memberships (user_id, plan, until) values (pay.user_id, pay.plan, new_until)
  on conflict (user_id) do update set plan = excluded.plan, until = excluded.until, updated_at = now();
  return new_until;
end;
$$;

create function public.reject_payment(p_utr text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.payments set status = 'rejected' where utr = p_utr and status = 'pending';
  if not found then
    raise exception 'no pending payment with reference %', p_utr;
  end if;
end;
$$;

revoke all on function public.verify_payment(text), public.reject_payment(text) from public, anon, authenticated;
