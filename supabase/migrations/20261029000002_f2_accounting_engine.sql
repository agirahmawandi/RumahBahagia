-- ============================================================================
-- Migration F2: Core Double-Entry Accounting Engine
-- ============================================================================

-- 1. Ledger Accounts (Chart of Accounts / COA) (BSD §4.2)
create table if not exists public.ledger_accounts (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  code text not null,
  name text not null,
  class public.account_class not null,
  parent_id uuid references public.ledger_accounts(id) on delete set null,
  is_system boolean not null default false,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_ledger_accounts_household_code unique (household_id, code)
);

-- 2. Journal Entries (Header) (BSD §4.2)
create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  entry_date date not null default current_date,
  type public.txn_type not null,
  description text not null,
  reference_type text,
  reference_id uuid,
  tags text[] default '{}'::text[],
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  voided_at timestamptz
);

-- 3. Journal Lines (Detail Baris Debit & Kredit) (BSD §4.2)
create table if not exists public.journal_lines (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.journal_entries(id) on delete cascade,
  household_id uuid not null references public.households(id) on delete cascade,
  account_id uuid not null references public.ledger_accounts(id) on delete restrict,
  debit numeric(18,2) not null default 0 check (debit >= 0),
  credit numeric(18,2) not null default 0 check (credit >= 0),
  memo text,
  created_at timestamptz not null default now(),
  constraint chk_debit_xor_credit check (
    (debit = 0 and credit > 0) or (credit = 0 and debit > 0)
  )
);

-- Indexes for Accounting Engine
create index if not exists idx_ledger_accounts_household_class on public.ledger_accounts(household_id, class);
create index if not exists idx_ledger_accounts_parent_id on public.ledger_accounts(parent_id);
create index if not exists idx_journal_entries_household_date on public.journal_entries(household_id, entry_date desc) where voided_at is null;
create index if not exists idx_journal_lines_entry_id on public.journal_lines(entry_id);
create index if not exists idx_journal_lines_account_id on public.journal_lines(account_id);
create index if not exists idx_journal_lines_household_id on public.journal_lines(household_id);

-- Updated_at triggers
drop trigger if exists trg_ledger_accounts_updated_at on public.ledger_accounts;
create trigger trg_ledger_accounts_updated_at
  before update on public.ledger_accounts
  for each row execute function public.set_updated_at();

drop trigger if exists trg_journal_entries_updated_at on public.journal_entries;
create trigger trg_journal_entries_updated_at
  before update on public.journal_entries
  for each row execute function public.set_updated_at();

-- 4. Constraint Trigger: Validasi Keseimbangan Jurnal (BSD §4.2)
create or replace function public.validate_journal_entry_balance()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_entry_id uuid := coalesce(new.entry_id, old.entry_id);
  v_sum_debit numeric(18,2);
  v_sum_credit numeric(18,2);
  v_count int;
begin
  select
    coalesce(sum(debit), 0),
    coalesce(sum(credit), 0),
    count(*)
  into v_sum_debit, v_sum_credit, v_count
  from public.journal_lines
  where entry_id = v_entry_id;

  if v_count > 0 then
    if v_count < 2 then
      raise exception 'Jurnal tidak lengkap: minimal harus ada 2 baris jurnal (1 Debit & 1 Kredit).';
    end if;

    if v_sum_debit <> v_sum_credit then
      raise exception 'Jurnal tidak seimbang: Total Debit (%) tidak sama dengan Total Kredit (%).',
        v_sum_debit, v_sum_credit;
    end if;
  end if;

  return null;
end;
$$;

drop trigger if exists trg_journal_entry_balance on public.journal_lines;
create constraint trigger trg_journal_entry_balance
  after insert or update or delete on public.journal_lines
  deferrable initially deferred
  for each row execute function public.validate_journal_entry_balance();

-- 5. View: Saldo per Akun (Natural Sign) (BSD §5)
create or replace view public.v_account_balances with (security_invoker = true) as
select
  la.id as account_id,
  la.household_id,
  la.code,
  la.name,
  la.class,
  la.parent_id,
  la.is_system,
  la.archived_at,
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
left join public.journal_entries je on je.id = jl.entry_id and je.voided_at is null
where la.archived_at is null and (jl.id is null or je.id is not null)
group by la.id;

-- 6. RPC: create_household + Seed COA Bawaan (BSD §6)
create or replace function public.create_household(
  p_name text,
  p_type public.household_type default 'family'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_household_id uuid;
  v_parent_id uuid;
begin
  if v_user_id is null then
    raise exception 'Tidak terautentikasi';
  end if;

  if coalesce(trim(p_name), '') = '' then
    raise exception 'Nama buku keuangan tidak boleh kosong';
  end if;

  -- 1. Buat household
  insert into public.households (name, type, created_by)
  values (trim(p_name), p_type, v_user_id)
  returning id into v_household_id;

  -- 2. Daftarkan pembuat sebagai Owner
  insert into public.household_members (household_id, user_id, role)
  values (v_household_id, v_user_id, 'owner');

  -- 3. Set default household pada profiles jika belum ada
  update public.profiles
  set default_household_id = coalesce(default_household_id, v_household_id)
  where id = v_user_id;

  -- 4. Seed Chart of Accounts (COA) Bawaan (BSD §4.2)
  -- Aset (1-0000)
  insert into public.ledger_accounts (household_id, code, name, class, is_system)
  values (v_household_id, '1-0000', 'Aset', 'asset', true)
  returning id into v_parent_id;

  insert into public.ledger_accounts (household_id, code, name, class, parent_id, is_system) values
    (v_household_id, '1-1000', 'Kas & Bank', 'asset', v_parent_id, true),
    (v_household_id, '1-2000', 'Tabungan Terencana', 'asset', v_parent_id, true),
    (v_household_id, '1-3000', 'Investasi', 'asset', v_parent_id, true),
    (v_household_id, '1-4000', 'Aset Tetap', 'asset', v_parent_id, true),
    (v_household_id, '1-5000', 'Piutang', 'asset', v_parent_id, true);

  -- Liabilitas (2-0000)
  insert into public.ledger_accounts (household_id, code, name, class, is_system)
  values (v_household_id, '2-0000', 'Liabilitas', 'liability', true)
  returning id into v_parent_id;

  insert into public.ledger_accounts (household_id, code, name, class, parent_id, is_system) values
    (v_household_id, '2-1000', 'Kartu Kredit', 'liability', v_parent_id, true),
    (v_household_id, '2-2000', 'Pinjaman & Cicilan', 'liability', v_parent_id, true);

  -- Ekuitas (3-0000)
  insert into public.ledger_accounts (household_id, code, name, class, is_system)
  values (v_household_id, '3-0000', 'Ekuitas / Kekayaan Bersih', 'equity', true)
  returning id into v_parent_id;

  insert into public.ledger_accounts (household_id, code, name, class, parent_id, is_system) values
    (v_household_id, '3-1000', 'Ekuitas Saldo Awal', 'equity', v_parent_id, true),
    (v_household_id, '3-2000', 'Selisih Revaluasi', 'equity', v_parent_id, true);

  -- Pendapatan (4-0000)
  insert into public.ledger_accounts (household_id, code, name, class, is_system)
  values (v_household_id, '4-0000', 'Pendapatan', 'income', true)
  returning id into v_parent_id;

  insert into public.ledger_accounts (household_id, code, name, class, parent_id, is_system) values
    (v_household_id, '4-1000', 'Gaji & Upah', 'income', v_parent_id, true),
    (v_household_id, '4-2000', 'Bonus & THR', 'income', v_parent_id, true),
    (v_household_id, '4-3000', 'Hasil Usaha', 'income', v_parent_id, true),
    (v_household_id, '4-4000', 'Hadiah & Bantuan', 'income', v_parent_id, true),
    (v_household_id, '4-5000', 'Pendapatan Investasi', 'income', v_parent_id, true),
    (v_household_id, '4-9000', 'Pendapatan Lain-lain', 'income', v_parent_id, true);

  -- Beban (5-0000)
  insert into public.ledger_accounts (household_id, code, name, class, is_system)
  values (v_household_id, '5-0000', 'Beban Pengeluaran', 'expense', true)
  returning id into v_parent_id;

  insert into public.ledger_accounts (household_id, code, name, class, parent_id, is_system) values
    (v_household_id, '5-1000', 'Makanan & Minuman', 'expense', v_parent_id, true),
    (v_household_id, '5-2000', 'Transportasi', 'expense', v_parent_id, true),
    (v_household_id, '5-3000', 'Tagihan & Utilitas', 'expense', v_parent_id, true),
    (v_household_id, '5-4000', 'Pendidikan Anak', 'expense', v_parent_id, true),
    (v_household_id, '5-5000', 'Kesehatan & Obat', 'expense', v_parent_id, true),
    (v_household_id, '5-6000', 'Belanja Rumah Tangga', 'expense', v_parent_id, true),
    (v_household_id, '5-7000', 'Hiburan & Liburan', 'expense', v_parent_id, true),
    (v_household_id, '5-8000', 'Sosial & Zakat', 'expense', v_parent_id, true),
    (v_household_id, '5-9000', 'Admin Bank & Biaya Transfer', 'expense', v_parent_id, true),
    (v_household_id, '5-9100', 'Bunga Pinjaman', 'expense', v_parent_id, true),
    (v_household_id, '5-9900', 'Beban Lain-lain', 'expense', v_parent_id, true);

  return v_household_id;
end;
$$;

revoke all on function public.create_household(text, public.household_type) from public, anon;
grant execute on function public.create_household(text, public.household_type) to authenticated;

-- 7. RPC: create_transaction (Atomic Insert Entry + Lines) (BSD §6)
create or replace function public.create_transaction(
  p_household_id uuid,
  p_type public.txn_type,
  p_entry_date date,
  p_description text,
  p_lines jsonb,
  p_ref_type text default null,
  p_ref_id uuid default null,
  p_tags text[] default '{}'::text[]
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_entry_id uuid;
  v_line jsonb;
  v_account_id uuid;
  v_debit numeric(18,2);
  v_credit numeric(18,2);
  v_memo text;
begin
  if not public.can_edit(p_household_id) then
    raise exception 'Akses ditolak: Anda tidak memiliki izin menginput transaksi pada buku ini.';
  end if;

  if jsonb_array_length(p_lines) < 2 then
    raise exception 'Transaksi minimal harus memiliki 2 baris jurnal (Debit & Kredit).';
  end if;

  insert into public.journal_entries (
    household_id, entry_date, type, description,
    reference_type, reference_id, tags, created_by, updated_by
  )
  values (
    p_household_id, p_entry_date, p_type, trim(p_description),
    p_ref_type, p_ref_id, coalesce(p_tags, '{}'::text[]), v_user_id, v_user_id
  )
  returning id into v_entry_id;

  for v_line in select * from jsonb_array_elements(p_lines)
  loop
    v_account_id := (v_line ->> 'account_id')::uuid;
    v_debit := coalesce((v_line ->> 'debit')::numeric(18,2), 0);
    v_credit := coalesce((v_line ->> 'credit')::numeric(18,2), 0);
    v_memo := v_line ->> 'memo';

    if not exists (
      select 1 from public.ledger_accounts
      where id = v_account_id and household_id = p_household_id
    ) then
      raise exception 'Akun tidak valid atau tidak terdaftar pada buku keuangan ini.';
    end if;

    insert into public.journal_lines (
      entry_id, household_id, account_id, debit, credit, memo
    )
    values (
      v_entry_id, p_household_id, v_account_id, v_debit, v_credit, v_memo
    );
  end loop;

  return v_entry_id;
end;
$$;

revoke all on function public.create_transaction(uuid, public.txn_type, date, text, jsonb, text, uuid, text[]) from public, anon;
grant execute on function public.create_transaction(uuid, public.txn_type, date, text, jsonb, text, uuid, text[]) to authenticated;

-- 8. RPC: void_transaction (Soft Delete) (BSD §6)
create or replace function public.void_transaction(p_entry_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_household_id uuid;
begin
  select household_id into v_household_id
  from public.journal_entries
  where id = p_entry_id and voided_at is null;

  if not found then
    raise exception 'Transaksi tidak ditemukan atau sudah dibatalkan.';
  end if;

  if not public.can_edit(v_household_id) then
    raise exception 'Akses ditolak: Anda tidak memiliki izin membatalkan transaksi pada buku ini.';
  end if;

  update public.journal_entries
  set
    voided_at = now(),
    updated_by = (select auth.uid()),
    updated_at = now()
  where id = p_entry_id;

  return true;
end;
$$;

revoke all on function public.void_transaction(uuid) from public, anon;
grant execute on function public.void_transaction(uuid) to authenticated;

-- 9. Row Level Security (RLS) untuk Akuntansi (BSD §7)
alter table public.ledger_accounts enable row level security;
alter table public.journal_entries enable row level security;
alter table public.journal_lines enable row level security;

-- Policies: ledger_accounts
drop policy if exists "ledger_accounts_select_member" on public.ledger_accounts;
create policy "ledger_accounts_select_member" on public.ledger_accounts
  for select to authenticated
  using (public.is_member(household_id));

drop policy if exists "ledger_accounts_insert_editor" on public.ledger_accounts;
create policy "ledger_accounts_insert_editor" on public.ledger_accounts
  for insert to authenticated
  with check (public.can_edit(household_id));

drop policy if exists "ledger_accounts_update_editor" on public.ledger_accounts;
create policy "ledger_accounts_update_editor" on public.ledger_accounts
  for update to authenticated
  using (public.can_edit(household_id))
  with check (public.can_edit(household_id));

drop policy if exists "ledger_accounts_delete_owner" on public.ledger_accounts;
create policy "ledger_accounts_delete_owner" on public.ledger_accounts
  for delete to authenticated
  using (public.is_owner(household_id) and not is_system);

-- Policies: journal_entries (Hanya dapat diubah melalui RPC)
drop policy if exists "journal_entries_select_member" on public.journal_entries;
create policy "journal_entries_select_member" on public.journal_entries
  for select to authenticated
  using (public.is_member(household_id));

-- Policies: journal_lines (Hanya dapat diubah melalui RPC)
drop policy if exists "journal_lines_select_member" on public.journal_lines;
create policy "journal_lines_select_member" on public.journal_lines
  for select to authenticated
  using (public.is_member(household_id));

