-- ============================================================================
-- Migration F5: Financial Reports, Accounting Views & Reporting RPCs
-- ============================================================================

-- 1. View: v_net_worth (Kekayaan Bersih per Household) (BSD §5)
create or replace view public.v_net_worth with (security_invoker = true) as
select
  la.household_id,
  coalesce(sum(case when la.class = 'asset' then jl.debit - jl.credit else 0 end), 0)::numeric(18,2) as total_assets,
  coalesce(sum(case when la.class = 'liability' then jl.credit - jl.debit else 0 end), 0)::numeric(18,2) as total_liabilities,
  coalesce(
    sum(
      case
        when la.class = 'asset' then jl.debit - jl.credit
        when la.class = 'liability' then -(jl.credit - jl.debit)
        else 0
      end
    ),
    0
  )::numeric(18,2) as net_worth
from public.ledger_accounts la
left join public.journal_lines jl on jl.account_id = la.id
left join public.journal_entries je on je.id = jl.entry_id and je.voided_at is null
where la.archived_at is null and (jl.id is null or je.id is not null)
group by la.household_id;

-- 2. View: v_transactions_list (Daftar Transaksi Lengkap) (BSD §5)
create or replace view public.v_transactions_list with (security_invoker = true) as
select
  je.id,
  je.household_id,
  je.entry_date,
  je.type,
  je.description,
  je.reference_type,
  je.reference_id,
  je.tags,
  je.created_by,
  je.voided_at,
  je.created_at,
  p.full_name as created_by_name,
  coalesce(sum(jl.debit), 0)::numeric(18,2) as amount
from public.journal_entries je
left join public.profiles p on p.id = je.created_by
left join public.journal_lines jl on jl.entry_id = je.id
where je.voided_at is null
group by je.id, p.full_name;

-- 3. RPC: report_balance_sheet (Neraca) (BSD §6)
create or replace function public.report_balance_sheet(
  p_household_id uuid,
  p_as_of date default current_date
)
returns table (
  account_id uuid,
  code text,
  name text,
  class public.account_class,
  balance numeric(18,2)
)
language sql
stable
security definer
set search_path = public
as $$
  select
    la.id as account_id,
    la.code,
    la.name,
    la.class,
    coalesce(
      sum(
        case
          when la.class in ('asset', 'expense') then jl.debit - jl.credit
          else jl.credit - jl.debit
        end
      ),
      0
    )::numeric(18,2) as balance
  from public.ledger_accounts la
  left join public.journal_lines jl on jl.account_id = la.id
  left join public.journal_entries je on je.id = jl.entry_id and je.voided_at is null and je.entry_date <= p_as_of
  where la.household_id = p_household_id
    and la.archived_at is null
    and la.class in ('asset', 'liability', 'equity')
    and public.is_member(p_household_id)
  group by la.id, la.code, la.name, la.class
  order by la.code;
$$;

revoke all on function public.report_balance_sheet(uuid, date) from public, anon;
grant execute on function public.report_balance_sheet(uuid, date) to authenticated;

-- 4. RPC: report_income_statement (Surplus / Defisit) (BSD §6)
create or replace function public.report_income_statement(
  p_household_id uuid,
  p_from date,
  p_to date
)
returns table (
  account_id uuid,
  code text,
  name text,
  class public.account_class,
  amount numeric(18,2)
)
language sql
stable
security definer
set search_path = public
as $$
  select
    la.id as account_id,
    la.code,
    la.name,
    la.class,
    coalesce(
      sum(
        case
          when la.class = 'income' then jl.credit - jl.debit
          when la.class = 'expense' then jl.debit - jl.credit
          else 0
        end
      ),
      0
    )::numeric(18,2) as amount
  from public.ledger_accounts la
  left join public.journal_lines jl on jl.account_id = la.id
  left join public.journal_entries je on je.id = jl.entry_id and je.voided_at is null and je.entry_date between p_from and p_to
  where la.household_id = p_household_id
    and la.archived_at is null
    and la.class in ('income', 'expense')
    and public.is_member(p_household_id)
  group by la.id, la.code, la.name, la.class
  order by la.code;
$$;

revoke all on function public.report_income_statement(uuid, date, date) from public, anon;
grant execute on function public.report_income_statement(uuid, date, date) to authenticated;

-- 5. RPC: report_general_ledger (Buku Besar) (BSD §6)
create or replace function public.report_general_ledger(
  p_account_id uuid,
  p_from date,
  p_to date
)
returns table (
  entry_id uuid,
  entry_date date,
  type public.txn_type,
  description text,
  debit numeric(18,2),
  credit numeric(18,2),
  balance_change numeric(18,2)
)
language sql
stable
security definer
set search_path = public
as $$
  select
    je.id as entry_id,
    je.entry_date,
    je.type,
    je.description,
    jl.debit,
    jl.credit,
    case
      when la.class in ('asset', 'expense') then jl.debit - jl.credit
      else jl.credit - jl.debit
    end as balance_change
  from public.journal_lines jl
  join public.journal_entries je on je.id = jl.entry_id and je.voided_at is null
  join public.ledger_accounts la on la.id = jl.account_id
  where jl.account_id = p_account_id
    and je.entry_date between p_from and p_to
    and public.is_member(la.household_id)
  order by je.entry_date asc, je.created_at asc;
$$;

revoke all on function public.report_general_ledger(uuid, date, date) from public, anon;
grant execute on function public.report_general_ledger(uuid, date, date) to authenticated;

