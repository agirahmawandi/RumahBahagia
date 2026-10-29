-- ============================================================================
-- Migration F4: Savings Goals, Investments, Assets, Liabilities & Budgets
-- ============================================================================

-- 1. Savings Goals (Pos Tabungan) (BSD §4.3)
create table if not exists public.savings_goals (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  ledger_account_id uuid not null unique references public.ledger_accounts(id) on delete cascade,
  name text not null,
  description text,
  icon text default 'piggy-bank',
  color text default '#00CEC8',
  target_amount numeric(18,2) not null default 0,
  target_date date,
  linked_account_id uuid references public.accounts(id) on delete set null,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Investments & Investment Transactions (BSD §4.3)
create table if not exists public.investments (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  ledger_account_id uuid not null unique references public.ledger_accounts(id) on delete cascade,
  name text not null,
  platform text,
  ticker text,
  type public.investment_type not null default 'mutual_fund',
  units numeric(24,8) not null default 0,
  avg_cost numeric(18,4) not null default 0,
  market_price numeric(18,4) not null default 0,
  market_value numeric(18,2) not null default 0,
  market_updated_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.investment_transactions (
  id uuid primary key default gen_random_uuid(),
  investment_id uuid not null references public.investments(id) on delete cascade,
  entry_id uuid not null references public.journal_entries(id) on delete cascade,
  kind text not null check (kind in ('buy', 'sell', 'dividend', 'revalue')),
  units numeric(24,8) default 0,
  price numeric(18,4) default 0,
  fee numeric(18,2) default 0,
  amount numeric(18,2) not null,
  realized_gain numeric(18,2) default 0,
  created_at timestamptz not null default now()
);

-- 3. Assets (Aset Tetap / Non-Kas) (BSD §4.3)
create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  ledger_account_id uuid not null unique references public.ledger_accounts(id) on delete cascade,
  name text not null,
  category public.asset_category not null default 'property',
  acquired_date date not null default current_date,
  acquisition_cost numeric(18,2) not null default 0,
  current_value numeric(18,2) not null default 0,
  depreciation_method text default 'none',
  useful_life_months int,
  disposed_at date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. Liabilities (Kewajiban / Utang) (BSD §4.3)
create table if not exists public.liabilities (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  ledger_account_id uuid not null unique references public.ledger_accounts(id) on delete cascade,
  name text not null,
  lender text,
  type public.liability_type not null default 'personal_loan',
  principal numeric(18,2) not null default 0,
  interest_rate numeric(6,3) default 0,
  tenor_months int default 0,
  start_date date not null default current_date,
  due_day int default 1,
  installment_amount numeric(18,2) default 0,
  closed_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5. Budgets (Anggaran Bulanan per Kategori) (BSD §4.3)
create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  period_month date not null,
  amount numeric(18,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_budgets_household_category_month unique (household_id, category_id, period_month)
);

-- Indexes for F4
create index if not exists idx_savings_goals_household on public.savings_goals(household_id);
create index if not exists idx_investments_household on public.investments(household_id);
create index if not exists idx_investment_txns_investment on public.investment_transactions(investment_id);
create index if not exists idx_assets_household on public.assets(household_id);
create index if not exists idx_liabilities_household on public.liabilities(household_id);
create index if not exists idx_budgets_household_period on public.budgets(household_id, period_month);

-- Updated_at triggers
drop trigger if exists trg_savings_goals_updated_at on public.savings_goals;
create trigger trg_savings_goals_updated_at
  before update on public.savings_goals
  for each row execute function public.set_updated_at();

drop trigger if exists trg_investments_updated_at on public.investments;
create trigger trg_investments_updated_at
  before update on public.investments
  for each row execute function public.set_updated_at();

drop trigger if exists trg_assets_updated_at on public.assets;
create trigger trg_assets_updated_at
  before update on public.assets
  for each row execute function public.set_updated_at();

drop trigger if exists trg_liabilities_updated_at on public.liabilities;
create trigger trg_liabilities_updated_at
  before update on public.liabilities
  for each row execute function public.set_updated_at();

drop trigger if exists trg_budgets_updated_at on public.budgets;
create trigger trg_budgets_updated_at
  before update on public.budgets
  for each row execute function public.set_updated_at();

-- RLS Policies
alter table public.savings_goals enable row level security;
alter table public.investments enable row level security;
alter table public.investment_transactions enable row level security;
alter table public.assets enable row level security;
alter table public.liabilities enable row level security;
alter table public.budgets enable row level security;

-- Policies: savings_goals
create policy "savings_goals_select_member" on public.savings_goals for select to authenticated using (public.is_member(household_id));
create policy "savings_goals_insert_editor" on public.savings_goals for insert to authenticated with check (public.can_edit(household_id));
create policy "savings_goals_update_editor" on public.savings_goals for update to authenticated using (public.can_edit(household_id)) with check (public.can_edit(household_id));
create policy "savings_goals_delete_owner" on public.savings_goals for delete to authenticated using (public.is_owner(household_id));

-- Policies: investments
create policy "investments_select_member" on public.investments for select to authenticated using (public.is_member(household_id));
create policy "investments_insert_editor" on public.investments for insert to authenticated with check (public.can_edit(household_id));
create policy "investments_update_editor" on public.investments for update to authenticated using (public.can_edit(household_id)) with check (public.can_edit(household_id));
create policy "investments_delete_owner" on public.investments for delete to authenticated using (public.is_owner(household_id));

-- Policies: investment_transactions
create policy "investment_txns_select_member" on public.investment_transactions for select to authenticated using (
  exists (select 1 from public.investments i where i.id = investment_id and public.is_member(i.household_id))
);

-- Policies: assets
create policy "assets_select_member" on public.assets for select to authenticated using (public.is_member(household_id));
create policy "assets_insert_editor" on public.assets for insert to authenticated with check (public.can_edit(household_id));
create policy "assets_update_editor" on public.assets for update to authenticated using (public.can_edit(household_id)) with check (public.can_edit(household_id));
create policy "assets_delete_owner" on public.assets for delete to authenticated using (public.is_owner(household_id));

-- Policies: liabilities
create policy "liabilities_select_member" on public.liabilities for select to authenticated using (public.is_member(household_id));
create policy "liabilities_insert_editor" on public.liabilities for insert to authenticated with check (public.can_edit(household_id));
create policy "liabilities_update_editor" on public.liabilities for update to authenticated using (public.can_edit(household_id)) with check (public.can_edit(household_id));
create policy "liabilities_delete_owner" on public.liabilities for delete to authenticated using (public.is_owner(household_id));

-- Policies: budgets
create policy "budgets_select_member" on public.budgets for select to authenticated using (public.is_member(household_id));
create policy "budgets_insert_editor" on public.budgets for insert to authenticated with check (public.can_edit(household_id));
create policy "budgets_update_editor" on public.budgets for update to authenticated using (public.can_edit(household_id)) with check (public.can_edit(household_id));
create policy "budgets_delete_owner" on public.budgets for delete to authenticated using (public.is_owner(household_id));

-- 6. RPC: create_savings_goal (BSD §6)
create or replace function public.create_savings_goal(
  p_household_id uuid,
  p_name text,
  p_target_amount numeric(18,2) default 0,
  p_target_date date default null,
  p_description text default null,
  p_icon text default 'piggy-bank',
  p_color text default '#00CEC8',
  p_linked_account_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ledger_id uuid;
  v_parent_id uuid;
  v_goal_id uuid;
  v_code text;
  v_next_num int;
begin
  if not public.can_edit(p_household_id) then
    raise exception 'Akses ditolak: Anda tidak memiliki izin membuat pos tabungan.';
  end if;

  select id into v_parent_id from public.ledger_accounts
  where household_id = p_household_id and code = '1-2000';

  select coalesce(max(substring(code from 4)::int), 2000) + 1 into v_next_num
  from public.ledger_accounts where household_id = p_household_id and code like '1-2%';
  v_code := '1-' || v_next_num::text;

  insert into public.ledger_accounts (household_id, code, name, class, parent_id, is_system)
  values (p_household_id, v_code, trim(p_name), 'asset', v_parent_id, false)
  returning id into v_ledger_id;

  insert into public.savings_goals (
    household_id, ledger_account_id, name, description,
    icon, color, target_amount, target_date, linked_account_id
  )
  values (
    p_household_id, v_ledger_id, trim(p_name), p_description,
    p_icon, p_color, coalesce(p_target_amount, 0), p_target_date, p_linked_account_id
  )
  returning id into v_goal_id;

  return v_goal_id;
end;
$$;

revoke all on function public.create_savings_goal(uuid, text, numeric, date, text, text, text, uuid) from public, anon;
grant execute on function public.create_savings_goal(uuid, text, numeric, date, text, text, text, uuid) to authenticated;

-- 7. RPC: saving_deposit & saving_withdraw (BSD §6)
create or replace function public.saving_deposit(
  p_goal_id uuid,
  p_account_id uuid,
  p_amount numeric(18,2),
  p_date date default current_date,
  p_note text default 'Setor tabungan'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_household_id uuid;
  v_goal_ledger_id uuid;
  v_acc_ledger_id uuid;
  v_entry_id uuid;
begin
  select household_id, ledger_account_id into v_household_id, v_goal_ledger_id
  from public.savings_goals where id = p_goal_id;

  select ledger_account_id into v_acc_ledger_id
  from public.accounts where id = p_account_id and household_id = v_household_id;

  if v_goal_ledger_id is null or v_acc_ledger_id is null then
    raise exception 'Pos tabungan atau rekening sumber tidak valid.';
  end if;

  if not public.can_edit(v_household_id) then
    raise exception 'Akses ditolak: Anda tidak memiliki izin menginput transaksi.';
  end if;

  insert into public.journal_entries (
    household_id, entry_date, type, description, reference_type, reference_id, created_by
  )
  values (
    v_household_id, p_date, 'saving_deposit', trim(p_note), 'savings_goal', p_goal_id, (select auth.uid())
  )
  returning id into v_entry_id;

  -- Dr Pos Tabungan (Aset +), Cr Rekening Kas (Aset -)
  insert into public.journal_lines (entry_id, household_id, account_id, debit, credit, memo) values
    (v_entry_id, v_household_id, v_goal_ledger_id, p_amount, 0, trim(p_note)),
    (v_entry_id, v_household_id, v_acc_ledger_id, 0, p_amount, trim(p_note));

  return v_entry_id;
end;
$$;

revoke all on function public.saving_deposit(uuid, uuid, numeric, date, text) from public, anon;
grant execute on function public.saving_deposit(uuid, uuid, numeric, date, text) to authenticated;

create or replace function public.saving_withdraw(
  p_goal_id uuid,
  p_account_id uuid,
  p_amount numeric(18,2),
  p_date date default current_date,
  p_note text default 'Tarik tabungan'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_household_id uuid;
  v_goal_ledger_id uuid;
  v_acc_ledger_id uuid;
  v_entry_id uuid;
begin
  select household_id, ledger_account_id into v_household_id, v_goal_ledger_id
  from public.savings_goals where id = p_goal_id;

  select ledger_account_id into v_acc_ledger_id
  from public.accounts where id = p_account_id and household_id = v_household_id;

  if v_goal_ledger_id is null or v_acc_ledger_id is null then
    raise exception 'Pos tabungan atau rekening tujuan tidak valid.';
  end if;

  if not public.can_edit(v_household_id) then
    raise exception 'Akses ditolak: Anda tidak memiliki izin menginput transaksi.';
  end if;

  insert into public.journal_entries (
    household_id, entry_date, type, description, reference_type, reference_id, created_by
  )
  values (
    v_household_id, p_date, 'saving_withdraw', trim(p_note), 'savings_goal', p_goal_id, (select auth.uid())
  )
  returning id into v_entry_id;

  -- Dr Rekening Kas (Aset +), Cr Pos Tabungan (Aset -)
  insert into public.journal_lines (entry_id, household_id, account_id, debit, credit, memo) values
    (v_entry_id, v_household_id, v_acc_ledger_id, p_amount, 0, trim(p_note)),
    (v_entry_id, v_household_id, v_goal_ledger_id, 0, p_amount, trim(p_note));

  return v_entry_id;
end;
$$;

revoke all on function public.saving_withdraw(uuid, uuid, numeric, date, text) from public, anon;
grant execute on function public.saving_withdraw(uuid, uuid, numeric, date, text) to authenticated;

