import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export interface TransactionItem {
  id: string;
  household_id: string;
  entry_date: string;
  type: string;
  description: string;
  reference_type: string | null;
  reference_id: string | null;
  tags: string[];
  amount: number;
  created_by_name: string | null;
  created_at: string;
}

export interface MonthlyCashFlow {
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
}

export const getTransactions = cache(
  async (
    householdId: string,
    options?: {
      type?: string;
      limit?: number;
      offset?: number;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<TransactionItem[]> => {
    const supabase = await createClient();

    let query = supabase
      .from("v_transactions_list")
      .select("*")
      .eq("household_id", householdId)
      .order("entry_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (options?.type && options.type !== "all") {
      query = query.eq("type", options.type);
    }

    if (options?.startDate) {
      query = query.gte("entry_date", options.startDate);
    }

    if (options?.endDate) {
      query = query.lte("entry_date", options.endDate);
    }

    if (options?.limit) {
      const from = options.offset || 0;
      const to = from + options.limit - 1;
      query = query.range(from, to);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    return data.map((t) => ({
      ...t,
      amount: Number(t.amount) || 0,
      tags: Array.isArray(t.tags) ? (t.tags as string[]) : [],
    }));
  }
);

export const getMonthlyCashFlow = cache(
  async (householdId: string, yearMonth?: string): Promise<MonthlyCashFlow> => {
    const supabase = await createClient();

    // Default ke bulan berjalan: YYYY-MM
    const ym = yearMonth || new Date().toISOString().substring(0, 7);
    const startDate = `${ym}-01`;
    // Ambil hari terakhir bulan
    const [year, month] = ym.split("-").map(Number);
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${ym}-${String(lastDay).padStart(2, "0")}`;

    const { data } = await supabase
      .from("v_transactions_list")
      .select("type, amount")
      .eq("household_id", householdId)
      .gte("entry_date", startDate)
      .lte("entry_date", endDate);

    let totalIncome = 0;
    let totalExpense = 0;

    data?.forEach((row) => {
      const amt = Number(row.amount) || 0;
      if (row.type === "income") {
        totalIncome += amt;
      } else if (row.type === "expense") {
        totalExpense += amt;
      }
    });

    return {
      totalIncome,
      totalExpense,
      netSavings: totalIncome - totalExpense,
    };
  }
);

