import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export interface AssetItem {
  id: string;
  household_id: string;
  ledger_account_id: string;
  name: string;
  category: string;
  acquired_date: string;
  acquisition_cost: number;
  current_value: number;
  depreciation_method: string | null;
  notes: string | null;
  balance: number;
}

export const getAssets = cache(
  async (householdId: string): Promise<AssetItem[]> => {
    const supabase = await createClient();

    const [assetsRes, balancesRes] = await Promise.all([
      supabase
        .from("assets")
        .select("*")
        .eq("household_id", householdId)
        .is("disposed_at", null)
        .order("acquired_date", { ascending: false }),
      supabase
        .from("v_account_balances")
        .select("account_id, balance")
        .eq("household_id", householdId),
    ]);

    const assets = assetsRes.data;
    if (assetsRes.error || !assets) return [];

    const balanceMap = new Map<string, number>();
    balancesRes.data?.forEach((b) => {
      balanceMap.set(b.account_id, Number(b.balance) || 0);
    });

    return assets.map((a) => ({
      ...a,
      acquisition_cost: Number(a.acquisition_cost) || 0,
      current_value: Number(a.current_value) || 0,
      balance: balanceMap.get(a.ledger_account_id) ?? Number(a.current_value) ?? 0,
    }));
  }
);

