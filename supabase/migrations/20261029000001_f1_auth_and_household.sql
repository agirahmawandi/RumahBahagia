-- ============================================================================
-- Migration F1: Enums, Profiles, Households, Members, Invitations & RLS
-- ============================================================================

create extension if not exists pgcrypto;

-- 1. Enums (BSD §3)
do $$ begin
  create type public.member_role as enum ('owner', 'editor', 'viewer');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.household_type as enum ('personal', 'family');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.account_class as enum ('asset', 'liability', 'equity', 'income', 'expense');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.cash_account_type as enum ('cash', 'bank', 'ewallet', 'credit_card');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.txn_type as enum (
    'income', 'expense', 'transfer', 'saving_deposit', 'saving_withdraw',
    'investment_buy', 'investment_sell', 'investment_dividend', 'revaluation',
    'asset_purchase', 'asset_disposal', 'liability_drawdown', 'liability_payment',
    'opening_balance', 'adjustment', 'manual_journal'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.investment_type as enum (
    'mutual_fund', 'stock', 'gold', 'bond', 'deposit', 'crypto', 'other'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.asset_category as enum (
    'property', 'vehicle', 'electronics', 'land', 'jewelry', 'other'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.liability_type as enum (
    'mortgage', 'vehicle_loan', 'personal_loan', 'credit_card', 'paylater', 'other'
  );
exception when duplicate_object then null; end $$;

-- 2. Helper Trigger Function: updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 3. Identitas & Tenant Tables (BSD §4.1)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  default_household_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type public.household_type not null default 'family',
  currency char(3) not null default 'IDR',
  allow_negative_balance boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$ begin
  alter table public.profiles
    add constraint profiles_default_household_id_fkey
    foreign key (default_household_id) references public.households(id) on delete set null;
exception when duplicate_object then null; end $$;

create table if not exists public.household_members (
  household_id uuid not null references public.households(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.member_role not null default 'editor',
  joined_at timestamptz not null default now(),
  primary key (household_id, user_id)
);

create table if not exists public.household_invitations (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  email text not null,
  role public.member_role not null default 'editor',
  token text not null unique default encode(extensions.gen_random_bytes(24), 'hex'),
  invited_by uuid references public.profiles(id) on delete set null,
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

-- Indexes for F1
create index if not exists idx_profiles_default_household on public.profiles(default_household_id);
create index if not exists idx_households_created_by on public.households(created_by);
create index if not exists idx_household_members_user_id on public.household_members(user_id);
create index if not exists idx_household_invitations_household_id on public.household_invitations(household_id);
create index if not exists idx_household_invitations_invited_by on public.household_invitations(invited_by);
create index if not exists idx_household_invitations_token on public.household_invitations(token);

-- Updated_at triggers
drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists trg_households_updated_at on public.households;
create trigger trg_households_updated_at
  before update on public.households
  for each row execute function public.set_updated_at();

-- 4. Trigger: Otomatis buat profil saat user mendaftar di auth.users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do update
  set
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 5. Helper Membership Functions untuk RLS (BSD §7)
create or replace function public.is_member(h uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1
    from public.household_members
    where household_id = h
      and user_id = (select auth.uid())
  );
$$;

create or replace function public.can_edit(h uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1
    from public.household_members
    where household_id = h
      and user_id = (select auth.uid())
      and role in ('owner', 'editor')
  );
$$;

create or replace function public.is_owner(h uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1
    from public.household_members
    where household_id = h
      and user_id = (select auth.uid())
      and role = 'owner'
  );
$$;

revoke all on function public.is_member(uuid) from public, anon;
grant execute on function public.is_member(uuid) to authenticated;

revoke all on function public.can_edit(uuid) from public, anon;
grant execute on function public.can_edit(uuid) to authenticated;

revoke all on function public.is_owner(uuid) from public, anon;
grant execute on function public.is_owner(uuid) to authenticated;

-- 6. Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.households enable row level security;
alter table public.household_members enable row level security;
alter table public.household_invitations enable row level security;

-- Policies: profiles
drop policy if exists "profiles_select_visible" on public.profiles;
create policy "profiles_select_visible" on public.profiles
  for select to authenticated
  using (
    id = (select auth.uid())
    or exists (
      select 1
      from public.household_members hm1
      join public.household_members hm2 on hm1.household_id = hm2.household_id
      where hm1.user_id = (select auth.uid())
        and hm2.user_id = public.profiles.id
    )
  );

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated
  with check (id = (select auth.uid()));

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Policies: households
drop policy if exists "households_select_member" on public.households;
create policy "households_select_member" on public.households
  for select to authenticated
  using (public.is_member(id));

drop policy if exists "households_insert_authenticated" on public.households;
create policy "households_insert_authenticated" on public.households
  for insert to authenticated
  with check (created_by = (select auth.uid()));

drop policy if exists "households_update_owner" on public.households;
create policy "households_update_owner" on public.households
  for update to authenticated
  using (public.is_owner(id))
  with check (public.is_owner(id));

drop policy if exists "households_delete_owner" on public.households;
create policy "households_delete_owner" on public.households
  for delete to authenticated
  using (public.is_owner(id));

-- Policies: household_members
drop policy if exists "household_members_select_member" on public.household_members;
create policy "household_members_select_member" on public.household_members
  for select to authenticated
  using (public.is_member(household_id));

drop policy if exists "household_members_insert_owner" on public.household_members;
create policy "household_members_insert_owner" on public.household_members
  for insert to authenticated
  with check (public.is_owner(household_id));

drop policy if exists "household_members_update_owner" on public.household_members;
create policy "household_members_update_owner" on public.household_members
  for update to authenticated
  using (public.is_owner(household_id))
  with check (public.is_owner(household_id));

drop policy if exists "household_members_delete_owner_or_self" on public.household_members;
create policy "household_members_delete_owner_or_self" on public.household_members
  for delete to authenticated
  using (public.is_owner(household_id) or user_id = (select auth.uid()));

-- Policies: household_invitations
drop policy if exists "invitations_select_member" on public.household_invitations;
create policy "invitations_select_member" on public.household_invitations
  for select to authenticated
  using (public.is_member(household_id));

drop policy if exists "invitations_insert_owner" on public.household_invitations;
create policy "invitations_insert_owner" on public.household_invitations
  for insert to authenticated
  with check (public.is_owner(household_id));

drop policy if exists "invitations_update_owner" on public.household_invitations;
create policy "invitations_update_owner" on public.household_invitations
  for update to authenticated
  using (public.is_owner(household_id))
  with check (public.is_owner(household_id));

drop policy if exists "invitations_delete_owner" on public.household_invitations;
create policy "invitations_delete_owner" on public.household_invitations
  for delete to authenticated
  using (public.is_owner(household_id));

-- 7. RPC: accept_invitation (BSD §6)
create or replace function public.accept_invitation(p_token text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_inv public.household_invitations%rowtype;
begin
  if v_user_id is null then
    raise exception 'Tidak terautentikasi';
  end if;

  select * into v_inv
  from public.household_invitations
  where token = p_token
    and accepted_at is null
    and expires_at > now()
  for update;

  if not found then
    raise exception 'Undangan tidak ditemukan atau sudah kadaluarsa';
  end if;

  insert into public.household_members (household_id, user_id, role)
  values (v_inv.household_id, v_user_id, v_inv.role)
  on conflict (household_id, user_id) do nothing;

  update public.household_invitations
  set accepted_at = now()
  where id = v_inv.id;

  update public.profiles
  set default_household_id = coalesce(default_household_id, v_inv.household_id)
  where id = v_user_id;

  return v_inv.household_id;
end;
$$;

revoke all on function public.accept_invitation(text) from public, anon;
grant execute on function public.accept_invitation(text) to authenticated;
