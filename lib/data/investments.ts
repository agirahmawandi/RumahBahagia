import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export interface InvestmentItem {
  id: string;
  household_id: string;
  ledger_account_id: string;
  name: string;
  platform: string | null;
  ticker: string | null;
  type: string;
  units: number;
  avg_cost: number;
  market_price: number;
  market_value: number;
  market_updated_at: string | null;
  totalCost: number;
  unrealizedGain: number;
  unrealizedGainPercent: number;
}

export const getInvestments = cache(
  async (householdId: string): Promise<InvestmentItem[]> => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("investments")
      .select("*")
      .eq("household_id", householdId)
      .is("archived_at", null)
      .order("created_at", { ascending: true });

    if (error || !data) return [];

    return data.map((inv) => {
      const units = Number(inv.units) || 0;
      const avgCost = Number(inv.avg_cost) || 0;
      const marketPrice = Number(inv.market_price) || 0;
      const marketValue = Number(inv.market_value) || 0;
      const totalCost = units * avgCost;
      const unrealizedGain = marketValue - totalCost;
      const unrealizedGainPercent = totalCost > 0 ? (unrealizedGain / totalCost) * 100 : 0;

      return {
        ...inv,
        units,
        avg_cost: avgCost,
        market_price: marketPrice,
        market_value: marketValue,
        totalCost,
        unrealizedGain,
        unrealizedGainPercent,
      };
    });
  }
);

