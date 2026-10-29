import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export interface AccountWithBalance {
  id: string;
  household_id: string;
  ledger_account_id: string;
  name: string;
  type: "cash" | "bank" | "ewallet" | "credit_card";
  institution: string | null;
  account_number_last4: string | null;
  color: string | null;
  icon: string | null;
  credit_limit: number;
  balance: number;
}

export interface CategoryItem {
  id: string;
  household_id: string;
  ledger_account_id: string;
  name: string;
  kind: "income" | "expense";
  icon: string | null;
  color: string | null;
  parent_id: string | null;
}

export const getAccounts = cache(async (householdId: string): Promise<AccountWithBalance[]> => {
  const supabase = await createClient();

  const { data: accounts, error } = await supabase
    .from("accounts")
    .select(`
      id,
      household_id,
      ledger_account_id,
      name,
      type,
      institution,
      account_number_last4,
      color,
      icon,
      credit_limit
    `)
    .eq("household_id", householdId)
    .is("archived_at", null)
    .order("created_at", { ascending: true });

  if (error || !accounts) return [];

  // Ambil saldo dari v_account_balances
  const { data: balances } = await supabase
    .from("v_account_balances")
    .select("account_id, balance")
    .eq("household_id", householdId);

  const balanceMap = new Map<string, number>();
  balances?.forEach((b) => {
    balanceMap.set(b.account_id, Number(b.balance) || 0);
  });

  return accounts.map((acc) => ({
    ...acc,
    credit_limit: Number(acc.credit_limit) || 0,
    balance: balanceMap.get(acc.ledger_account_id) ?? 0,
  }));
});

export const getCategories = cache(
  async (householdId: string, kind?: "income" | "expense"): Promise<CategoryItem[]> => {
    const supabase = await createClient();

    let query = supabase
      .from("categories")
      .select("id, household_id, ledger_account_id, name, kind, icon, color, parent_id")
      .eq("household_id", householdId)
      .is("archived_at", null)
      .order("name", { ascending: true });

    if (kind) {
      query = query.eq("kind", kind);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    return data.map((c) => ({
      ...c,
      kind: c.kind as "income" | "expense",
    }));
  }
);

