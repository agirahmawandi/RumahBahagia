-- ============================================================================
-- Migration F3: Accounts, Categories, Attachments, Storage & Daily Txn RPCs
-- ============================================================================

-- 1. Accounts (Rekening & Cash) (BSD §4.3)
create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  ledger_account_id uuid not null unique references public.ledger_accounts(id) on delete cascade,
  name text not null,
  type public.cash_account_type not null default 'bank',
  institution text,
  account_number_last4 text,
  owner_member_id uuid references public.profiles(id) on delete set null,
  color text default '#00CEC8',
  icon text default 'wallet',
  credit_limit numeric(18,2) default 0,
  sort_order int default 0,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Categories (Kategori Pemasukan & Pengeluaran) (BSD §4.3)
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  ledger_account_id uuid not null unique references public.ledger_accounts(id) on delete cascade,
  name text not null,
  icon text default 'tag',
  color text default '#FF9C5F',
  kind text not null check (kind in ('income', 'expense')),
  parent_id uuid references public.categories(id) on delete set null,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Attachments (Lampiran Bukti Struk) (BSD §4.3)
create table if not exists public.attachments (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  entry_id uuid not null references public.journal_entries(id) on delete cascade,
  storage_path text not null,
  mime_type text,
  size bigint,
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Indexes for F3
create index if not exists idx_accounts_household_type on public.accounts(household_id, type);
create index if not exists idx_accounts_ledger_account_id on public.accounts(ledger_account_id);
create index if not exists idx_categories_household_kind on public.categories(household_id, kind);
create index if not exists idx_categories_parent_id on public.categories(parent_id);
create index if not exists idx_attachments_entry_id on public.attachments(entry_id);
create index if not exists idx_attachments_household_id on public.attachments(household_id);

-- Updated_at triggers
drop trigger if exists trg_accounts_updated_at on public.accounts;
create trigger trg_accounts_updated_at
  before update on public.accounts
  for each row execute function public.set_updated_at();

drop trigger if exists trg_categories_updated_at on public.categories;
create trigger trg_categories_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

-- 4. Storage Bucket: receipts (BSD §7)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'receipts',
  'receipts',
  false,
  10485760, -- 10MB
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do update set
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

-- Storage RLS
drop policy if exists "receipts_select_member" on storage.objects;
create policy "receipts_select_member" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'receipts'
    and public.is_member((storage.foldername(name))[1]::uuid)
  );

drop policy if exists "receipts_insert_editor" on storage.objects;
create policy "receipts_insert_editor" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'receipts'
    and public.can_edit((storage.foldername(name))[1]::uuid)
  );

drop policy if exists "receipts_update_editor" on storage.objects;
create policy "receipts_update_editor" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'receipts'
    and public.can_edit((storage.foldername(name))[1]::uuid)
  )
  with check (
    bucket_id = 'receipts'
    and public.can_edit((storage.foldername(name))[1]::uuid)
  );

drop policy if exists "receipts_delete_editor" on storage.objects;
create policy "receipts_delete_editor" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'receipts'
    and public.can_edit((storage.foldername(name))[1]::uuid)
  );

-- 5. RLS on F3 Tables
alter table public.accounts enable row level security;
alter table public.categories enable row level security;
alter table public.attachments enable row level security;

-- Policies: accounts
drop policy if exists "accounts_select_member" on public.accounts;
create policy "accounts_select_member" on public.accounts
  for select to authenticated
  using (public.is_member(household_id));

drop policy if exists "accounts_insert_editor" on public.accounts;
create policy "accounts_insert_editor" on public.accounts
  for insert to authenticated
  with check (public.can_edit(household_id));

drop policy if exists "accounts_update_editor" on public.accounts;
create policy "accounts_update_editor" on public.accounts
  for update to authenticated
  using (public.can_edit(household_id))
  with check (public.can_edit(household_id));

drop policy if exists "accounts_delete_owner" on public.accounts;
create policy "accounts_delete_owner" on public.accounts
  for delete to authenticated
  using (public.is_owner(household_id));

-- Policies: categories
drop policy if exists "categories_select_member" on public.categories;
create policy "categories_select_member" on public.categories
  for select to authenticated
  using (public.is_member(household_id));

drop policy if exists "categories_insert_editor" on public.categories;
create policy "categories_insert_editor" on public.categories
  for insert to authenticated
  with check (public.can_edit(household_id));

drop policy if exists "categories_update_editor" on public.categories;
create policy "categories_update_editor" on public.categories
  for update to authenticated
  using (public.can_edit(household_id))
  with check (public.can_edit(household_id));

drop policy if exists "categories_delete_owner" on public.categories;
create policy "categories_delete_owner" on public.categories
  for delete to authenticated
  using (public.is_owner(household_id));

-- Policies: attachments
drop policy if exists "attachments_select_member" on public.attachments;
create policy "attachments_select_member" on public.attachments
  for select to authenticated
  using (public.is_member(household_id));

drop policy if exists "attachments_insert_editor" on public.attachments;
create policy "attachments_insert_editor" on public.attachments
  for insert to authenticated
  with check (public.can_edit(household_id));

drop policy if exists "attachments_delete_editor" on public.attachments;
create policy "attachments_delete_editor" on public.attachments
  for delete to authenticated
  using (public.can_edit(household_id));

-- 6. RPC: create_cash_account (+ Saldo Awal Otomatis) (BSD §6)
create or replace function public.create_cash_account(
  p_household_id uuid,
  p_name text,
  p_type public.cash_account_type,
  p_opening_balance numeric(18,2) default 0,
  p_institution text default null,
  p_account_number_last4 text default null,
  p_color text default '#00CEC8',
  p_icon text default 'wallet',
  p_credit_limit numeric(18,2) default 0
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ledger_id uuid;
  v_parent_id uuid;
  v_equity_account_id uuid;
  v_account_id uuid;
  v_entry_id uuid;
  v_code text;
  v_class public.account_class;
  v_next_num int;
begin
  if not public.can_edit(p_household_id) then
    raise exception 'Akses ditolak: Anda tidak memiliki izin menambah rekening.';
  end if;

  if p_type = 'credit_card' then
    v_class := 'liability';
    select id into v_parent_id from public.ledger_accounts
    where household_id = p_household_id and code = '2-1000';
    select coalesce(max(substring(code from 4)::int), 1000) + 1 into v_next_num
    from public.ledger_accounts where household_id = p_household_id and code like '2-1%';
    v_code := '2-' || v_next_num::text;
  else
    v_class := 'asset';
    select id into v_parent_id from public.ledger_accounts
    where household_id = p_household_id and code = '1-1000';
    select coalesce(max(substring(code from 4)::int), 1000) + 1 into v_next_num
    from public.ledger_accounts where household_id = p_household_id and code like '1-1%';
    v_code := '1-' || v_next_num::text;
  end if;

  -- 1. Buat akun di ledger_accounts
  insert into public.ledger_accounts (household_id, code, name, class, parent_id, is_system)
  values (p_household_id, v_code, trim(p_name), v_class, v_parent_id, false)
  returning id into v_ledger_id;

  -- 2. Buat akun di accounts
  insert into public.accounts (
    household_id, ledger_account_id, name, type, institution,
    account_number_last4, color, icon, credit_limit
  )
  values (
    p_household_id, v_ledger_id, trim(p_name), p_type, p_institution,
    p_account_number_last4, p_color, p_icon, coalesce(p_credit_limit, 0)
  )
  returning id into v_account_id;

  -- 3. Jurnal saldo awal jika > 0 (Double-entry: Dr Rekening, Cr Ekuitas Saldo Awal)
  if coalesce(p_opening_balance, 0) > 0 then
    select id into v_equity_account_id
    from public.ledger_accounts
    where household_id = p_household_id and code = '3-1000';

    if v_equity_account_id is null then
      raise exception 'Akun Ekuitas Saldo Awal (3-1000) tidak ditemukan.';
    end if;

    insert into public.journal_entries (
      household_id, entry_date, type, description, reference_type, reference_id, created_by
    )
    values (
      p_household_id, current_date, 'opening_balance',
      'Saldo awal rekening ' || trim(p_name), 'account', v_account_id, (select auth.uid())
    )
    returning id into v_entry_id;

    if v_class = 'asset' then
      -- Dr Kas (aset naik), Cr Ekuitas Saldo Awal (ekuitas naik)
      insert into public.journal_lines (entry_id, household_id, account_id, debit, credit, memo) values
        (v_entry_id, p_household_id, v_ledger_id, p_opening_balance, 0, 'Saldo awal'),
        (v_entry_id, p_household_id, v_equity_account_id, 0, p_opening_balance, 'Saldo awal');
    else
      -- Kartu kredit: Dr Ekuitas, Cr Kartu Kredit (liabilitas naik)
      insert into public.journal_lines (entry_id, household_id, account_id, debit, credit, memo) values
        (v_entry_id, p_household_id, v_equity_account_id, p_opening_balance, 0, 'Saldo awal hutang kartu'),
        (v_entry_id, p_household_id, v_ledger_id, 0, p_opening_balance, 'Saldo awal hutang kartu');
    end if;
  end if;

  return v_account_id;
end;
$$;

revoke all on function public.create_cash_account(uuid, text, public.cash_account_type, numeric, text, text, text, text, numeric) from public, anon;
grant execute on function public.create_cash_account(uuid, text, public.cash_account_type, numeric, text, text, text, text, numeric) to authenticated;

-- 7. RPC: record_income (Pemasukan) (BSD §6)
create or replace function public.record_income(
  p_household_id uuid,
  p_date date,
  p_amount numeric(18,2),
  p_category_id uuid,
  p_account_id uuid,
  p_description text,
  p_tags text[] default '{}'::text[]
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_account_ledger_id uuid;
  v_cat_ledger_id uuid;
  v_entry_id uuid;
begin
  if not public.can_edit(p_household_id) then
    raise exception 'Akses ditolak: Anda tidak memiliki izin mencatat pemasukan.';
  end if;

  if coalesce(p_amount, 0) <= 0 then
    raise exception 'Nominal pemasukan harus lebih besar dari 0.';
  end if;

  select ledger_account_id into v_account_ledger_id
  from public.accounts
  where id = p_account_id and household_id = p_household_id;

  select ledger_account_id into v_cat_ledger_id
  from public.categories
  where id = p_category_id and household_id = p_household_id;

  if v_account_ledger_id is null or v_cat_ledger_id is null then
    raise exception 'Rekening tujuan atau kategori pemasukan tidak valid.';
  end if;

  insert into public.journal_entries (
    household_id, entry_date, type, description, reference_type, reference_id, tags, created_by
  )
  values (
    p_household_id, p_date, 'income', trim(p_description), 'category', p_category_id, coalesce(p_tags, '{}'::text[]), (select auth.uid())
  )
  returning id into v_entry_id;

  -- Double Entry: Dr Rekening (Aset +), Cr Kategori (Income +)
  insert into public.journal_lines (entry_id, household_id, account_id, debit, credit, memo) values
    (v_entry_id, p_household_id, v_account_ledger_id, p_amount, 0, trim(p_description)),
    (v_entry_id, p_household_id, v_cat_ledger_id, 0, p_amount, trim(p_description));

  return v_entry_id;
end;
$$;

revoke all on function public.record_income(uuid, date, numeric, uuid, uuid, text, text[]) from public, anon;
grant execute on function public.record_income(uuid, date, numeric, uuid, uuid, text, text[]) to authenticated;

-- 8. RPC: record_expense (Pengeluaran) (BSD §6)
create or replace function public.record_expense(
  p_household_id uuid,
  p_date date,
  p_amount numeric(18,2),
  p_category_id uuid,
  p_account_id uuid,
  p_description text,
  p_tags text[] default '{}'::text[]
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_account_ledger_id uuid;
  v_cat_ledger_id uuid;
  v_entry_id uuid;
begin
  if not public.can_edit(p_household_id) then
    raise exception 'Akses ditolak: Anda tidak memiliki izin mencatat pengeluaran.';
  end if;

  if coalesce(p_amount, 0) <= 0 then
    raise exception 'Nominal pengeluaran harus lebih besar dari 0.';
  end if;

  select ledger_account_id into v_account_ledger_id
  from public.accounts
  where id = p_account_id and household_id = p_household_id;

  select ledger_account_id into v_cat_ledger_id
  from public.categories
  where id = p_category_id and household_id = p_household_id;

  if v_account_ledger_id is null or v_cat_ledger_id is null then
    raise exception 'Rekening sumber atau kategori pengeluaran tidak valid.';
  end if;

  insert into public.journal_entries (
    household_id, entry_date, type, description, reference_type, reference_id, tags, created_by
  )
  values (
    p_household_id, p_date, 'expense', trim(p_description), 'category', p_category_id, coalesce(p_tags, '{}'::text[]), (select auth.uid())
  )
  returning id into v_entry_id;

  -- Double Entry: Dr Kategori (Beban +), Cr Rekening (Aset - / Kartu Kredit +)
  insert into public.journal_lines (entry_id, household_id, account_id, debit, credit, memo) values
    (v_entry_id, p_household_id, v_cat_ledger_id, p_amount, 0, trim(p_description)),
    (v_entry_id, p_household_id, v_account_ledger_id, 0, p_amount, trim(p_description));

  return v_entry_id;
end;
$$;

revoke all on function public.record_expense(uuid, date, numeric, uuid, uuid, text, text[]) from public, anon;
grant execute on function public.record_expense(uuid, date, numeric, uuid, uuid, text, text[]) to authenticated;

-- 9. RPC: record_transfer (Transfer Antar Rekening) (BSD §6)
create or replace function public.record_transfer(
  p_household_id uuid,
  p_date date,
  p_amount numeric(18,2),
  p_from_account_id uuid,
  p_to_account_id uuid,
  p_admin_fee numeric(18,2) default 0,
  p_description text default 'Transfer dana'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_from_ledger_id uuid;
  v_to_ledger_id uuid;
  v_admin_ledger_id uuid;
  v_entry_id uuid;
begin
  if not public.can_edit(p_household_id) then
    raise exception 'Akses ditolak: Anda tidak memiliki izin membuat transfer.';
  end if;

  if p_from_account_id = p_to_account_id then
    raise exception 'Rekening sumber dan rekening tujuan tidak boleh sama.';
  end if;

  if coalesce(p_amount, 0) <= 0 then
    raise exception 'Nominal transfer harus lebih besar dari 0.';
  end if;

  select ledger_account_id into v_from_ledger_id
  from public.accounts where id = p_from_account_id and household_id = p_household_id;

  select ledger_account_id into v_to_ledger_id
  from public.accounts where id = p_to_account_id and household_id = p_household_id;

  if v_from_ledger_id is null or v_to_ledger_id is null then
    raise exception 'Rekening asal atau rekening tujuan tidak valid.';
  end if;

  insert into public.journal_entries (
    household_id, entry_date, type, description, reference_type, reference_id, created_by
  )
  values (
    p_household_id, p_date, 'transfer', trim(p_description), 'account', p_to_account_id, (select auth.uid())
  )
  returning id into v_entry_id;

  -- 1. Transfer pokok: Dr Rekening Tujuan (+), Cr Rekening Asal (-)
  insert into public.journal_lines (entry_id, household_id, account_id, debit, credit, memo) values
    (v_entry_id, p_household_id, v_to_ledger_id, p_amount, 0, 'Transfer masuk'),
    (v_entry_id, p_household_id, v_from_ledger_id, 0, p_amount, 'Transfer keluar');

  -- 2. Biaya admin (jika ada): Dr Beban Admin Bank (5-9000), Cr Rekening Asal (-)
  if coalesce(p_admin_fee, 0) > 0 then
    select id into v_admin_ledger_id
    from public.ledger_accounts
    where household_id = p_household_id and code = '5-9000';

    if v_admin_ledger_id is not null then
      insert into public.journal_lines (entry_id, household_id, account_id, debit, credit, memo) values
        (v_entry_id, p_household_id, v_admin_ledger_id, p_admin_fee, 0, 'Biaya admin transfer'),
        (v_entry_id, p_household_id, v_from_ledger_id, 0, p_admin_fee, 'Biaya admin transfer');
    end if;
  end if;

  return v_entry_id;
end;
$$;

revoke all on function public.record_transfer(uuid, date, numeric, uuid, uuid, numeric, text) from public, anon;
grant execute on function public.record_transfer(uuid, date, numeric, uuid, uuid, numeric, text) to authenticated;

