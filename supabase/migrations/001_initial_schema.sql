-- ============================================================
-- YusTech Client Portal — Initial Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── Enums ────────────────────────────────────────────────────
create type user_role as enum ('client', 'admin');
create type plan as enum ('basic', 'standard', 'business', 'business_pro');
create type subscription_status as enum ('active', 'overdue', 'cancelled');
create type billing_cycle as enum ('monthly', 'annual');
create type request_category as enum ('bug', 'content', 'feature', 'emergency');
create type request_status as enum ('open', 'in_progress', 'resolved');
create type invoice_status as enum ('paid', 'failed', 'pending');

-- ── Users ─────────────────────────────────────────────────────
create table public.users (
  id          uuid primary key default uuid_generate_v4(),
  clerk_id    text unique not null,
  email       text unique not null,
  name        text not null,
  role        user_role not null default 'client',
  created_at  timestamptz not null default now()
);

-- ── Subscriptions ─────────────────────────────────────────────
create table public.subscriptions (
  id                          uuid primary key default uuid_generate_v4(),
  user_id                     uuid not null references public.users(id) on delete cascade,
  plan                        plan not null,
  track                       text not null default 'wordpress',
  status                      subscription_status not null default 'active',
  billing_cycle               billing_cycle not null default 'monthly',
  next_renewal_date           date not null,
  paystack_subscription_id    text,
  paystack_customer_code      text,
  outgrown                    boolean not null default false,
  site_url                    text,
  requests_used_this_month    int not null default 0,
  usage_reset_date            date not null default (date_trunc('month', now()) + interval '1 month')::date,
  created_at                  timestamptz not null default now(),

  constraint one_active_subscription_per_user unique (user_id)
);

-- ── Support Requests ──────────────────────────────────────────
create table public.support_requests (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references public.users(id) on delete cascade,
  title        text not null,
  body         text not null,
  category     request_category not null,
  status       request_status not null default 'open',
  out_of_scope boolean not null default false,
  created_at   timestamptz not null default now(),
  resolved_at  timestamptz
);

-- ── Invoices ──────────────────────────────────────────────────
create table public.invoices (
  id                   uuid primary key default uuid_generate_v4(),
  user_id              uuid not null references public.users(id) on delete cascade,
  subscription_id      uuid not null references public.subscriptions(id) on delete cascade,
  amount               int not null, -- in kobo
  currency             text not null default 'NGN',
  status               invoice_status not null default 'pending',
  paystack_reference   text,
  created_at           timestamptz not null default now()
);

-- ── Indexes ───────────────────────────────────────────────────
create index on public.subscriptions (user_id);
create index on public.support_requests (user_id);
create index on public.support_requests (status);
create index on public.invoices (user_id);
create index on public.invoices (subscription_id);

-- ── Row Level Security ────────────────────────────────────────
alter table public.users enable row level security;
alter table public.subscriptions enable row level security;
alter table public.support_requests enable row level security;
alter table public.invoices enable row level security;

-- Helper: get clerk_id from JWT
create or replace function public.requesting_user_clerk_id()
returns text
language sql stable
as $$
  select coalesce(
    current_setting('request.jwt.claims', true)::json->>'sub',
    (current_setting('request.jwt.claims', true)::json->>'sub')
  );
$$;

-- Helper: get internal user_id from clerk_id
create or replace function public.current_user_id()
returns uuid
language sql stable
as $$
  select id from public.users
  where clerk_id = public.requesting_user_clerk_id()
  limit 1;
$$;

-- Helper: is current user admin
create or replace function public.is_admin()
returns boolean
language sql stable
as $$
  select exists (
    select 1 from public.users
    where clerk_id = public.requesting_user_clerk_id()
    and role = 'admin'
  );
$$;

-- ── RLS Policies: users ───────────────────────────────────────
create policy "Users can read own record"
  on public.users for select
  using (clerk_id = public.requesting_user_clerk_id() or public.is_admin());

create policy "Users can update own record"
  on public.users for update
  using (clerk_id = public.requesting_user_clerk_id());

create policy "Service role can insert users"
  on public.users for insert
  with check (true); -- restricted via service role key in API routes

-- ── RLS Policies: subscriptions ──────────────────────────────
create policy "Clients can read own subscription"
  on public.subscriptions for select
  using (user_id = public.current_user_id() or public.is_admin());

create policy "Service role manages subscriptions"
  on public.subscriptions for all
  using (public.is_admin())
  with check (public.is_admin());

-- ── RLS Policies: support_requests ───────────────────────────
create policy "Clients can read own requests"
  on public.support_requests for select
  using (user_id = public.current_user_id() or public.is_admin());

create policy "Clients can insert own requests"
  on public.support_requests for insert
  with check (user_id = public.current_user_id());

create policy "Admin can update requests"
  on public.support_requests for update
  using (public.is_admin());

-- ── RLS Policies: invoices ────────────────────────────────────
create policy "Clients can read own invoices"
  on public.invoices for select
  using (user_id = public.current_user_id() or public.is_admin());

-- ── Monthly usage reset function ─────────────────────────────
-- Call this via a scheduled Supabase edge function or cron
create or replace function public.reset_monthly_usage()
returns void
language sql
as $$
  update public.subscriptions
  set
    requests_used_this_month = 0,
    usage_reset_date = (date_trunc('month', now()) + interval '1 month')::date
  where usage_reset_date <= now()::date;
$$;
