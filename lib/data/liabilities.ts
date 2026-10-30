import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export interface LiabilityItem {
  id: string;
  household_id: string;
  ledger_account_id: string;
  name: string;
  lender: string | null;
  type: string;
  principal: number;
  interest_rate: number;
  tenor_months: number;
  start_date: string;
  due_day: number;
  installment_amount: number;
  remainingBalance: number;
  paidAmount: number;
  progressPercent: number;
}

export const getLiabilities = cache(
  async (householdId: string): Promise<LiabilityItem[]> => {
    const supabase = await createClient();

    const [liabilitiesRes, balancesRes] = await Promise.all([
      supabase
        .from("liabilities")
        .select("*")
        .eq("household_id", householdId)
        .is("closed_at", null)
        .order("created_at", { ascending: true }),
      supabase
        .from("v_account_balances")
        .select("account_id, balance")
        .eq("household_id", householdId),
    ]);

    const liabilities = liabilitiesRes.data;
    if (liabilitiesRes.error || !liabilities) return [];

    const balanceMap = new Map<string, number>();
    balancesRes.data?.forEach((b) => {
      balanceMap.set(b.account_id, Number(b.balance) || 0);
    });

    return liabilities.map((l) => {
      const principal = Number(l.principal) || 0;
      // Di ledger, liabilitas bersaldo kredit positif. Sisa utang adalah balance
      const remainingBalance = balanceMap.get(l.ledger_account_id) ?? principal;
      const paidAmount = Math.max(0, principal - remainingBalance);
      const progressPercent = principal > 0 ? Math.min(100, Math.round((paidAmount / principal) * 100)) : 0;

      return {
        ...l,
        principal,
        interest_rate: Number(l.interest_rate) || 0,
        tenor_months: Number(l.tenor_months) || 0,
        installment_amount: Number(l.installment_amount) || 0,
        remainingBalance,
        paidAmount,
        progressPercent,
      };
    });
  }
);

