-- ============================================================================
-- Migration: Fix Chart of Accounts (COA) Sub-Account Code Generation
-- Fixes unique constraint violation (uq_ledger_accounts_household_code)
-- when creating savings goals, cash accounts, investments, assets, and liabilities.
-- ============================================================================

-- 1. Perbaiki data lama yang sempat terbuat dengan kode '1-1' dan '2-1'
UPDATE public.ledger_accounts SET code = '1-1001' WHERE code = '1-1';
UPDATE public.ledger_accounts SET code = '2-2001' WHERE code = '2-1';

-- 2. Perbaiki fungsi create_cash_account
CREATE OR REPLACE FUNCTION public.create_cash_account(
  p_household_id uuid,
  p_name text,
  p_type public.cash_account_type default 'bank',
  p_opening_balance numeric(18,2) default 0,
  p_institution text default null,
  p_account_number_last4 text default null,
  p_color text default '#00CEC8',
  p_icon text default 'wallet',
  p_credit_limit numeric(18,2) default 0
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ledger_id uuid;
  v_parent_id uuid;
  v_account_id uuid;
  v_code text;
  v_class public.account_class;
  v_next_num int;
  v_equity_ledger_id uuid;
  v_entry_id uuid;
BEGIN
  IF NOT public.can_edit(p_household_id) THEN
    RAISE EXCEPTION 'Akses ditolak: Anda tidak memiliki izin menambah rekening.';
  END IF;

  IF p_type = 'credit_card' THEN
    v_class := 'liability';
    SELECT id INTO v_parent_id FROM public.ledger_accounts
    WHERE household_id = p_household_id AND code = '2-1000';
    SELECT coalesce(max(substring(code from 3)::int), 1000) + 1 INTO v_next_num
    FROM public.ledger_accounts WHERE household_id = p_household_id AND code ~ '^2-1[0-9]{3}$';
    v_code := '2-' || v_next_num::text;
  ELSE
    v_class := 'asset';
    SELECT id INTO v_parent_id FROM public.ledger_accounts
    WHERE household_id = p_household_id AND code = '1-1000';
    SELECT coalesce(max(substring(code from 3)::int), 1000) + 1 INTO v_next_num
    FROM public.ledger_accounts WHERE household_id = p_household_id AND code ~ '^1-1[0-9]{3}$';
    v_code := '1-' || v_next_num::text;
  END IF;

  INSERT INTO public.ledger_accounts (household_id, code, name, class, parent_id, is_system)
  VALUES (p_household_id, v_code, trim(p_name), v_class, v_parent_id, false)
  RETURNING id INTO v_ledger_id;

  INSERT INTO public.accounts (
    household_id, ledger_account_id, name, type, institution,
    account_number_last4, color, icon, credit_limit
  )
  VALUES (
    p_household_id, v_ledger_id, trim(p_name), p_type, p_institution,
    p_account_number_last4, p_color, p_icon, coalesce(p_credit_limit, 0)
  )
  RETURNING id INTO v_account_id;

  IF coalesce(p_opening_balance, 0) <> 0 THEN
    SELECT id INTO v_equity_ledger_id FROM public.ledger_accounts
    WHERE household_id = p_household_id AND code = '3-1000';

    IF v_equity_ledger_id IS NOT NULL THEN
      INSERT INTO public.journal_entries (
        household_id, entry_date, type, description, reference_type, reference_id, created_by
      )
      VALUES (
        p_household_id, current_date, 'transfer', 'Saldo Awal: ' || trim(p_name), 'account', v_account_id, (SELECT auth.uid())
      )
      RETURNING id INTO v_entry_id;

      IF p_type = 'credit_card' THEN
        IF p_opening_balance > 0 THEN
          INSERT INTO public.journal_lines (entry_id, household_id, account_id, debit, credit, memo) VALUES
            (v_entry_id, p_household_id, v_equity_ledger_id, p_opening_balance, 0, 'Saldo Awal Liabilitas'),
            (v_entry_id, p_household_id, v_ledger_id, 0, p_opening_balance, 'Saldo Awal: ' || trim(p_name));
        END IF;
      ELSE
        IF p_opening_balance > 0 THEN
          INSERT INTO public.journal_lines (entry_id, household_id, account_id, debit, credit, memo) VALUES
            (v_entry_id, p_household_id, v_ledger_id, p_opening_balance, 0, 'Saldo Awal: ' || trim(p_name)),
            (v_entry_id, p_household_id, v_equity_ledger_id, 0, p_opening_balance, 'Ekuitas Saldo Awal');
        END IF;
      END IF;
    END IF;
  END IF;

  RETURN v_account_id;
END;
$$;

-- 3. Perbaiki fungsi create_savings_goal
CREATE OR REPLACE FUNCTION public.create_savings_goal(
  p_household_id uuid,
  p_name text,
  p_target_amount numeric(18,2) default 0,
  p_target_date date default null,
  p_description text default null,
  p_icon text default 'piggy-bank',
  p_color text default '#00CEC8',
  p_linked_account_id uuid default null
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ledger_id uuid;
  v_parent_id uuid;
  v_goal_id uuid;
  v_code text;
  v_next_num int;
BEGIN
  IF NOT public.can_edit(p_household_id) THEN
    RAISE EXCEPTION 'Akses ditolak: Anda tidak memiliki izin membuat pos tabungan.';
  END IF;

  SELECT id INTO v_parent_id FROM public.ledger_accounts
  WHERE household_id = p_household_id AND code = '1-2000';

  SELECT coalesce(max(substring(code from 3)::int), 2000) + 1 INTO v_next_num
  FROM public.ledger_accounts WHERE household_id = p_household_id AND code ~ '^1-2[0-9]{3}$';
  v_code := '1-' || v_next_num::text;

  INSERT INTO public.ledger_accounts (household_id, code, name, class, parent_id, is_system)
  VALUES (p_household_id, v_code, trim(p_name), 'asset', v_parent_id, false)
  RETURNING id INTO v_ledger_id;

  INSERT INTO public.savings_goals (
    household_id, ledger_account_id, name, description,
    icon, color, target_amount, target_date, linked_account_id
  )
  VALUES (
    p_household_id, v_ledger_id, trim(p_name), p_description,
    p_icon, p_color, coalesce(p_target_amount, 0), p_target_date, p_linked_account_id
  )
  RETURNING id INTO v_goal_id;

  RETURN v_goal_id;
END;
$$;

-- 4. Perbaiki fungsi create_investment
CREATE OR REPLACE FUNCTION public.create_investment(
  p_household_id uuid,
  p_name text,
  p_type public.investment_type default 'mutual_fund',
  p_platform text default null,
  p_ticker text default null
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_parent_id uuid;
  v_ledger_id uuid;
  v_inv_id uuid;
  v_next_num int;
  v_code text;
BEGIN
  IF NOT public.can_edit(p_household_id) THEN
    RAISE EXCEPTION 'Akses ditolak: Anda tidak memiliki izin membuat portofolio investasi.';
  END IF;

  SELECT id INTO v_parent_id FROM public.ledger_accounts
  WHERE household_id = p_household_id AND code = '1-3000';

  SELECT coalesce(max(substring(code from 3)::int), 3000) + 1 INTO v_next_num
  FROM public.ledger_accounts WHERE household_id = p_household_id AND code ~ '^1-3[0-9]{3}$';
  v_code := '1-' || v_next_num::text;

  INSERT INTO public.ledger_accounts (household_id, code, name, class, parent_id, is_system)
  VALUES (p_household_id, v_code, trim(p_name), 'asset', v_parent_id, false)
  RETURNING id INTO v_ledger_id;

  INSERT INTO public.investments (
    household_id, ledger_account_id, name, platform, ticker, type
  )
  VALUES (
    p_household_id, v_ledger_id, trim(p_name), p_platform, p_ticker, p_type
  )
  RETURNING id INTO v_inv_id;

  RETURN v_inv_id;
END;
$$;

-- 5. Perbaiki fungsi create_asset
CREATE OR REPLACE FUNCTION public.create_asset(
  p_household_id uuid,
  p_name text,
  p_category public.asset_category default 'property',
  p_cost numeric(18,2) default 0,
  p_account_id uuid default null,
  p_acquired_date date default current_date,
  p_notes text default null
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_parent_id uuid;
  v_ledger_id uuid;
  v_asset_id uuid;
  v_next_num int;
  v_code text;
  v_entry_id uuid;
  v_credit_ledger_id uuid;
BEGIN
  IF NOT public.can_edit(p_household_id) THEN
    RAISE EXCEPTION 'Akses ditolak: Anda tidak memiliki izin mencatat aset tetap.';
  END IF;

  SELECT id INTO v_parent_id FROM public.ledger_accounts
  WHERE household_id = p_household_id AND code = '1-4000';

  SELECT coalesce(max(substring(code from 3)::int), 4000) + 1 INTO v_next_num
  FROM public.ledger_accounts WHERE household_id = p_household_id AND code ~ '^1-4[0-9]{3}$';
  v_code := '1-' || v_next_num::text;

  INSERT INTO public.ledger_accounts (household_id, code, name, class, parent_id, is_system)
  VALUES (p_household_id, v_code, trim(p_name), 'asset', v_parent_id, false)
  RETURNING id INTO v_ledger_id;

  INSERT INTO public.assets (
    household_id, ledger_account_id, name, category, acquired_date,
    acquisition_cost, current_value, notes
  )
  VALUES (
    p_household_id, v_ledger_id, trim(p_name), p_category, p_acquired_date,
    p_cost, p_cost, p_notes
  )
  RETURNING id INTO v_asset_id;

  IF coalesce(p_cost, 0) > 0 THEN
    IF p_account_id IS NOT NULL THEN
      SELECT ledger_account_id INTO v_credit_ledger_id
      FROM public.accounts WHERE id = p_account_id AND household_id = p_household_id;
    ELSE
      SELECT id INTO v_credit_ledger_id
      FROM public.ledger_accounts WHERE household_id = p_household_id AND code = '3-1000';
    END IF;

    IF v_credit_ledger_id IS NOT NULL THEN
      INSERT INTO public.journal_entries (
        household_id, entry_date, type, description, reference_type, reference_id, created_by
      )
      VALUES (
        p_household_id, p_acquired_date, 'expense', 'Perolehan Aset: ' || trim(p_name), 'asset', v_asset_id, (SELECT auth.uid())
      )
      RETURNING id INTO v_entry_id;

      INSERT INTO public.journal_lines (entry_id, household_id, account_id, debit, credit, memo) VALUES
        (v_entry_id, p_household_id, v_ledger_id, p_cost, 0, 'Perolehan Aset'),
        (v_entry_id, p_household_id, v_credit_ledger_id, 0, p_cost, 'Sumber Dana Pembelian Aset');
    END IF;
  END IF;

  RETURN v_asset_id;
END;
$$;

-- 6. Perbaiki fungsi create_liability
CREATE OR REPLACE FUNCTION public.create_liability(
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
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_parent_id uuid;
  v_ledger_id uuid;
  v_liab_id uuid;
  v_next_num int;
  v_code text;
  v_entry_id uuid;
  v_debit_ledger_id uuid;
BEGIN
  IF NOT public.can_edit(p_household_id) THEN
    RAISE EXCEPTION 'Akses ditolak: Anda tidak memiliki izin mencatat liabilitas.';
  END IF;

  SELECT id INTO v_parent_id FROM public.ledger_accounts
  WHERE household_id = p_household_id AND code = '2-2000';

  SELECT coalesce(max(substring(code from 3)::int), 2000) + 1 INTO v_next_num
  FROM public.ledger_accounts WHERE household_id = p_household_id AND code ~ '^2-2[0-9]{3}$';
  v_code := '2-' || v_next_num::text;

  INSERT INTO public.ledger_accounts (household_id, code, name, class, parent_id, is_system)
  VALUES (p_household_id, v_code, trim(p_name), 'liability', v_parent_id, false)
  RETURNING id INTO v_ledger_id;

  INSERT INTO public.liabilities (
    household_id, ledger_account_id, name, lender, type,
    principal, interest_rate, tenor_months, installment_amount
  )
  VALUES (
    p_household_id, v_ledger_id, trim(p_name), p_lender, p_type,
    p_principal, p_interest_rate, p_tenor_months, p_installment_amount
  )
  RETURNING id INTO v_liab_id;

  IF coalesce(p_principal, 0) > 0 THEN
    IF p_account_id IS NOT NULL THEN
      SELECT ledger_account_id INTO v_debit_ledger_id
      FROM public.accounts WHERE id = p_account_id AND household_id = p_household_id;
    ELSE
      SELECT id INTO v_debit_ledger_id
      FROM public.ledger_accounts WHERE household_id = p_household_id AND code = '3-1000';
    END IF;

    IF v_debit_ledger_id IS NOT NULL THEN
      INSERT INTO public.journal_entries (
        household_id, entry_date, type, description, reference_type, reference_id, created_by
      )
      VALUES (
        p_household_id, current_date, 'income', 'Pencairan Pinjaman: ' || trim(p_name), 'liability', v_liab_id, (SELECT auth.uid())
      )
      RETURNING id INTO v_entry_id;

      INSERT INTO public.journal_lines (entry_id, household_id, account_id, debit, credit, memo) VALUES
        (v_entry_id, p_household_id, v_debit_ledger_id, p_principal, 0, 'Penerimaan Dana Pinjaman'),
        (v_entry_id, p_household_id, v_ledger_id, 0, p_principal, 'Kewajiban Pokok Pinjaman');
    END IF;
  END IF;

  RETURN v_liab_id;
END;
$$;

-- 7. Izin eksekusi untuk authenticated role
GRANT EXECUTE ON FUNCTION public.create_cash_account TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_savings_goal TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_investment TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_asset TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_liability TO authenticated;
