-- ============================================================================
-- Migration F4/F5 Extended: Category Auto-Seed, Investments, Assets, Liabilities RPCs
-- ============================================================================

-- 1. Helper function: seed_household_categories
create or replace function public.seed_household_categories(p_household_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.categories (household_id, ledger_account_id, name, kind, icon, color)
  select 
    la.household_id,
    la.id,
    la.name,
    la.class::text,
    case 
      when la.code = '4-1000' then 'briefcase'
      when la.code = '4-2000' then 'gift'
      when la.code = '4-3000' then 'store'
      when la.code = '4-4000' then 'heart-handshake'
      when la.code = '4-5000' then 'trending-up'
      when la.code = '5-1000' then 'utensils'
      when la.code = '5-2000' then 'car'
      when la.code = '5-3000' then 'zap'
      when la.code = '5-4000' then 'graduation-cap'
      when la.code = '5-5000' then 'heart-pulse'
      when la.code = '5-6000' then 'shopping-bag'
      when la.code = '5-7000' then 'film'
      when la.code = '5-8000' then 'heart'
      when la.code = '5-9000' then 'credit-card'
      when la.code = '5-9100' then 'receipt'
      else 'tag'
    end,
    case 
      when la.class = 'income' then '#00CEC8'
      else '#FF9C5F'
    end
  from public.ledger_accounts la
  where la.household_id = p_household_id 
    and la.class in ('income', 'expense') 
    and la.parent_id is not null
    and not exists (
      select 1 from public.categories c where c.ledger_account_id = la.id
    );
end;
$$;

revoke all on function public.seed_household_categories(uuid) from public, anon;
grant execute on function public.seed_household_categories(uuid) to authenticated;

-- 2. Update create_household to automatically seed categories
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

  -- 5. Seed default categories directly linked to ledger accounts
  perform public.seed_household_categories(v_household_id);

  return v_household_id;
end;
$$;

-- 3. RPC: create_investment
create or replace function public.create_investment(
  p_household_id uuid,
  p_name text,
  p_type public.investment_type default 'mutual_fund',
  p_platform text default null,
  p_ticker text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_parent_id uuid;
  v_ledger_id uuid;
  v_inv_id uuid;
  v_next_num int;
  v_code text;
begin
  if not public.can_edit(p_household_id) then
    raise exception 'Akses ditolak: Anda tidak memiliki izin membuat portofolio investasi.';
  end if;

  select id into v_parent_id from public.ledger_accounts
  where household_id = p_household_id and code = '1-3000';

  select coalesce(max(substring(code from 4)::int), 3000) + 1 into v_next_num
  from public.ledger_accounts where household_id = p_household_id and code like '1-3%';
  v_code := '1-' || v_next_num::text;

  insert into public.ledger_accounts (household_id, code, name, class, parent_id, is_system)
  values (p_household_id, v_code, trim(p_name), 'asset', v_parent_id, false)
  returning id into v_ledger_id;

  insert into public.investments (
    household_id, ledger_account_id, name, platform, ticker, type
  )
  values (
    p_household_id, v_ledger_id, trim(p_name), p_platform, p_ticker, p_type
  )
  returning id into v_inv_id;

  return v_inv_id;
end;
$$;

revoke all on function public.create_investment(uuid, text, public.investment_type, text, text) from public, anon;
grant execute on function public.create_investment(uuid, text, public.investment_type, text, text) to authenticated;

-- 4. RPC: record_investment_buy
create or replace function public.record_investment_buy(
  p_investment_id uuid,
  p_account_id uuid,
  p_units numeric(24,8),
  p_price numeric(18,4),
  p_fee numeric(18,2) default 0,
  p_date date default current_date
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_household_id uuid;
  v_inv_ledger_id uuid;
  v_acc_ledger_id uuid;
  v_fee_ledger_id uuid;
  v_entry_id uuid;
  v_total_amount numeric(18,2);
  v_cur_units numeric(24,8);
  v_cur_avg_cost numeric(18,4);
  v_new_units numeric(24,8);
  v_new_avg_cost numeric(18,4);
begin
  select household_id, ledger_account_id, units, avg_cost
  into v_household_id, v_inv_ledger_id, v_cur_units, v_cur_avg_cost
  from public.investments where id = p_investment_id;

  select ledger_account_id into v_acc_ledger_id
  from public.accounts where id = p_account_id and household_id = v_household_id;

  if v_inv_ledger_id is null or v_acc_ledger_id is null then
    raise exception 'Investasi atau rekening sumber tidak valid.';
  end if;

  if not public.can_edit(v_household_id) then
    raise exception 'Akses ditolak: Anda tidak memiliki izin transaksi.';
  end if;

  v_total_amount := round(p_units * p_price, 2);

  insert into public.journal_entries (
    household_id, entry_date, type, description, reference_type, reference_id, created_by
  )
  values (
    v_household_id, p_date, 'investment_buy',
    'Beli investasi: ' || p_units || ' unit @ Rp ' || p_price,
    'investment', p_investment_id, (select auth.uid())
  )
  returning id into v_entry_id;

  -- Dr Investasi (+), Cr Rekening Kas (-)
  insert into public.journal_lines (entry_id, household_id, account_id, debit, credit, memo) values
    (v_entry_id, v_household_id, v_inv_ledger_id, v_total_amount, 0, 'Pembelian investasi'),
    (v_entry_id, v_household_id, v_acc_ledger_id, 0, v_total_amount, 'Pembelian investasi');

  -- Jika ada fee: Dr Admin Bank (5-9000), Cr Rekening Kas
  if coalesce(p_fee, 0) > 0 then
    select id into v_fee_ledger_id from public.ledger_accounts where household_id = v_household_id and code = '5-9000';
    if v_fee_ledger_id is not null then
      insert into public.journal_lines (entry_id, household_id, account_id, debit, credit, memo) values
        (v_entry_id, v_household_id, v_fee_ledger_id, p_fee, 0, 'Biaya transaksi investasi'),
        (v_entry_id, v_household_id, v_acc_ledger_id, 0, p_fee, 'Biaya transaksi investasi');
    end if;
  end if;

  -- Catat riwayat transaksi
  insert into public.investment_transactions (
    investment_id, entry_id, kind, units, price, fee, amount
  ) values (
    p_investment_id, v_entry_id, 'buy', p_units, p_price, p_fee, v_total_amount
  );

  -- Hitung moving average cost
  v_new_units := v_cur_units + p_units;
  if v_new_units > 0 then
    v_new_avg_cost := ((v_cur_units * v_cur_avg_cost) + (p_units * p_price)) / v_new_units;
  else
    v_new_avg_cost := p_price;
  end if;

  update public.investments
  set
    units = v_new_units,
    avg_cost = v_new_avg_cost,
    market_price = p_price,
    market_value = round(v_new_units * p_price, 2),
    market_updated_at = now()
  where id = p_investment_id;

  return v_entry_id;
end;
$$;

revoke all on function public.record_investment_buy(uuid, uuid, numeric, numeric, numeric, date) from public, anon;
grant execute on function public.record_investment_buy(uuid, uuid, numeric, numeric, numeric, date) to authenticated;

-- 5. RPC: create_asset
create or replace function public.create_asset(
  p_household_id uuid,
  p_name text,
  p_category public.asset_category default 'property',
  p_cost numeric(18,2) default 0,
  p_account_id uuid default null,
  p_acquired_date date default current_date,
  p_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_parent_id uuid;
  v_ledger_id uuid;
  v_asset_id uuid;
  v_next_num int;
  v_code text;
  v_entry_id uuid;
  v_credit_ledger_id uuid;
begin
  if not public.can_edit(p_household_id) then
    raise exception 'Akses ditolak: Anda tidak memiliki izin mencatat aset tetap.';
  end if;

  select id into v_parent_id from public.ledger_accounts
  where household_id = p_household_id and code = '1-4000';

  select coalesce(max(substring(code from 4)::int), 4000) + 1 into v_next_num
  from public.ledger_accounts where household_id = p_household_id and code like '1-4%';
  v_code := '1-' || v_next_num::text;

  insert into public.ledger_accounts (household_id, code, name, class, parent_id, is_system)
  values (p_household_id, v_code, trim(p_name), 'asset', v_parent_id, false)
  returning id into v_ledger_id;

  insert into public.assets (
    household_id, ledger_account_id, name, category, acquired_date,
    acquisition_cost, current_value, notes
  )
  values (
    p_household_id, v_ledger_id, trim(p_name), p_category, p_acquired_date,
    p_cost, p_cost, p_notes
  )
  returning id into v_asset_id;

  if coalesce(p_cost, 0) > 0 then
    if p_account_id is not null then
      select ledger_account_id into v_credit_ledger_id
      from public.accounts where id = p_account_id and household_id = p_household_id;
    else
      select id into v_credit_ledger_id
      from public.ledger_accounts where household_id = p_household_id and code = '3-1000';
    end if;

    if v_credit_ledger_id is not null then
      insert into public.journal_entries (
        household_id, entry_date, type, description, reference_type, reference_id, created_by
      )
      values (
        p_household_id, p_acquired_date, 'asset_purchase',
        'Akuisisi aset: ' || trim(p_name), 'asset', v_asset_id, (select auth.uid())
      )
      returning id into v_entry_id;

      insert into public.journal_lines (entry_id, household_id, account_id, debit, credit, memo) values
        (v_entry_id, p_household_id, v_ledger_id, p_cost, 0, 'Perolehan aset tetap'),
        (v_entry_id, p_household_id, v_credit_ledger_id, 0, p_cost, 'Sumber dana perolehan aset');
    end if;
  end if;

  return v_asset_id;
end;
$$;

revoke all on function public.create_asset(uuid, text, public.asset_category, numeric, uuid, date, text) from public, anon;
grant execute on function public.create_asset(uuid, text, public.asset_category, numeric, uuid, date, text) to authenticated;

-- 6. RPC: create_liability
create or replace function public.create_liability(
  p_household_id uuid,
  p_name text,
  p_type public.liability_type default 'personal_loan',
  p_lender text default null,
  p_principal numeric(18,2) default 0,
  p_interest_rate numeric(6,3) default 0,
  p_tenor_months int default 0,
  p_installment_amount numeric(18,2) default 0,
  p_account_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_parent_id uuid;
  v_ledger_id uuid;
  v_liab_id uuid;
  v_next_num int;
  v_code text;
  v_entry_id uuid;
  v_debit_ledger_id uuid;
begin
  if not public.can_edit(p_household_id) then
    raise exception 'Akses ditolak: Anda tidak memiliki izin mencatat liabilitas.';
  end if;

  select id into v_parent_id from public.ledger_accounts
  where household_id = p_household_id and code = '2-2000';

  select coalesce(max(substring(code from 4)::int), 2000) + 1 into v_next_num
  from public.ledger_accounts where household_id = p_household_id and code like '2-2%';
  v_code := '2-' || v_next_num::text;

  insert into public.ledger_accounts (household_id, code, name, class, parent_id, is_system)
  values (p_household_id, v_code, trim(p_name), 'liability', v_parent_id, false)
  returning id into v_ledger_id;

  insert into public.liabilities (
    household_id, ledger_account_id, name, lender, type,
    principal, interest_rate, tenor_months, installment_amount
  )
  values (
    p_household_id, v_ledger_id, trim(p_name), p_lender, p_type,
    p_principal, p_interest_rate, p_tenor_months, p_installment_amount
  )
  returning id into v_liab_id;

  if coalesce(p_principal, 0) > 0 then
    if p_account_id is not null then
      select ledger_account_id into v_debit_ledger_id
      from public.accounts where id = p_account_id and household_id = p_household_id;
    else
      select id into v_debit_ledger_id
      from public.ledger_accounts where household_id = p_household_id and code = '3-1000';
    end if;

    if v_debit_ledger_id is not null then
      insert into public.journal_entries (
        household_id, entry_date, type, description, reference_type, reference_id, created_by
      )
      values (
        p_household_id, current_date, 'opening_balance',
        'Pencatatan pinjaman: ' || trim(p_name), 'liability', v_liab_id, (select auth.uid())
      )
      returning id into v_entry_id;

      -- Dr Kas / Ekuitas, Cr Utang / Liabilitas
      insert into public.journal_lines (entry_id, household_id, account_id, debit, credit, memo) values
        (v_entry_id, p_household_id, v_debit_ledger_id, p_principal, 0, 'Penerimaan/Saldo awal pinjaman'),
        (v_entry_id, p_household_id, v_ledger_id, 0, p_principal, 'Kewajiban pinjaman');
    end if;
  end if;

  return v_liab_id;
end;
$$;

revoke all on function public.create_liability(uuid, text, public.liability_type, text, numeric, numeric, int, numeric, uuid) from public, anon;
grant execute on function public.create_liability(uuid, text, public.liability_type, text, numeric, numeric, int, numeric, uuid) to authenticated;

-- 7. RPC: record_liability_payment
create or replace function public.record_liability_payment(
  p_liability_id uuid,
  p_account_id uuid,
  p_principal_amount numeric(18,2),
  p_interest_amount numeric(18,2) default 0,
  p_date date default current_date,
  p_note text default 'Bayar cicilan'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_household_id uuid;
  v_liab_ledger_id uuid;
  v_acc_ledger_id uuid;
  v_interest_ledger_id uuid;
  v_entry_id uuid;
  v_total_paid numeric(18,2);
begin
  select household_id, ledger_account_id into v_household_id, v_liab_ledger_id
  from public.liabilities where id = p_liability_id;

  select ledger_account_id into v_acc_ledger_id
  from public.accounts where id = p_account_id and household_id = v_household_id;

  if v_liab_ledger_id is null or v_acc_ledger_id is null then
    raise exception 'Pinjaman atau rekening sumber tidak valid.';
  end if;

  if not public.can_edit(v_household_id) then
    raise exception 'Akses ditolak: Anda tidak memiliki izin transaksi.';
  end if;

  v_total_paid := coalesce(p_principal_amount, 0) + coalesce(p_interest_amount, 0);
  if v_total_paid <= 0 then
    raise exception 'Nominal cicilan harus lebih besar dari 0.';
  end if;

  insert into public.journal_entries (
    household_id, entry_date, type, description, reference_type, reference_id, created_by
  )
  values (
    v_household_id, p_date, 'expense', trim(p_note), 'liability', p_liability_id, (select auth.uid())
  )
  returning id into v_entry_id;

  -- 1. Dr Utang (Pokok berkurang)
  if coalesce(p_principal_amount, 0) > 0 then
    insert into public.journal_lines (entry_id, household_id, account_id, debit, credit, memo) values
      (v_entry_id, v_household_id, v_liab_ledger_id, p_principal_amount, 0, 'Pembayaran pokok utang');
  end if;

  -- 2. Dr Beban Bunga (5-9100)
  if coalesce(p_interest_amount, 0) > 0 then
    select id into v_interest_ledger_id
    from public.ledger_accounts where household_id = v_household_id and code = '5-9100';

    if v_interest_ledger_id is not null then
      insert into public.journal_lines (entry_id, household_id, account_id, debit, credit, memo) values
        (v_entry_id, v_household_id, v_interest_ledger_id, p_interest_amount, 0, 'Pembayaran bunga pinjaman');
    end if;
  end if;

  -- 3. Cr Rekening (Kas keluar = pokok + bunga)
  insert into public.journal_lines (entry_id, household_id, account_id, debit, credit, memo) values
    (v_entry_id, v_household_id, v_acc_ledger_id, 0, v_total_paid, 'Pembayaran cicilan');

  return v_entry_id;
end;
$$;

revoke all on function public.record_liability_payment(uuid, uuid, numeric, numeric, date, text) from public, anon;
grant execute on function public.record_liability_payment(uuid, uuid, numeric, numeric, date, text) to authenticated;

