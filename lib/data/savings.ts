import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export interface SavingsGoalWithBalance {
  id: string;
  household_id: string;
  ledger_account_id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  target_amount: number;
  target_date: string | null;
  linked_account_id: string | null;
  balance: number;
  progressPercent: number;
}

export const getSavingsGoals = cache(
  async (householdId: string): Promise<SavingsGoalWithBalance[]> => {
    const supabase = await createClient();

    const { data: goals, error } = await supabase
      .from("savings_goals")
      .select("*")
      .eq("household_id", householdId)
      .is("archived_at", null)
      .order("created_at", { ascending: true });

    if (error || !goals) return [];

    const { data: balances } = await supabase
      .from("v_account_balances")
      .select("account_id, balance")
      .eq("household_id", householdId);

    const balanceMap = new Map<string, number>();
    balances?.forEach((b) => {
      balanceMap.set(b.account_id, Number(b.balance) || 0);
    });

    return goals.map((g) => {
      const balance = balanceMap.get(g.ledger_account_id) ?? 0;
      const target = Number(g.target_amount) || 0;
      const progressPercent = target > 0 ? Math.min(100, Math.round((balance / target) * 100)) : 0;

      return {
        ...g,
        target_amount: target,
        balance,
        progressPercent,
      };
    });
  }
);

