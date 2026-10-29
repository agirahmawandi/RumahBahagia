import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export interface NetWorthSummary {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
}

export interface BalanceSheetRow {
  accountId: string;
  code: string;
  name: string;
  class: Database["public"]["Enums"]["account_class"];
  balance: number;
}

export interface IncomeStatementRow {
  accountId: string;
  code: string;
  name: string;
  class: Database["public"]["Enums"]["account_class"];
  total: number;
}

export interface GeneralLedgerRow {
  entryId: string;
  entryDate: string;
  description: string;
  debit: number;
  credit: number;
  balanceChange: number;
}

type BalanceSheetDbRow =
  Database["public"]["Functions"]["report_balance_sheet"]["Returns"][number];
type IncomeStatementDbRow =
  Database["public"]["Functions"]["report_income_statement"]["Returns"][number];
type GeneralLedgerDbRow =
  Database["public"]["Functions"]["report_general_ledger"]["Returns"][number];

export const getNetWorth = cache(
  async (householdId: string): Promise<NetWorthSummary> => {
    const supabase = await createClient();

    const { data } = await supabase
      .from("v_net_worth")
      .select("total_assets, total_liabilities, net_worth")
      .eq("household_id", householdId)
      .maybeSingle();

    if (!data) {
      return { totalAssets: 0, totalLiabilities: 0, netWorth: 0 };
    }

    return {
      totalAssets: Number(data.total_assets) || 0,
      totalLiabilities: Number(data.total_liabilities) || 0,
      netWorth: Number(data.net_worth) || 0,
    };
  }
);

export const getBalanceSheet = cache(
  async (householdId: string, asOf?: string): Promise<BalanceSheetRow[]> => {
    const supabase = await createClient();
    const asOfDate = asOf || new Date().toISOString().substring(0, 10);

    const { data, error } = await supabase.rpc("report_balance_sheet", {
      p_household_id: householdId,
      p_as_of: asOfDate,
    });

    if (error || !data) return [];

    const rows = data as BalanceSheetDbRow[];
    return rows.map((r: BalanceSheetDbRow) => ({
      accountId: r.account_id,
      code: r.code,
      name: r.name,
      class: r.class,
      balance: Number(r.balance) || 0,
    }));
  }
);

export const getIncomeStatement = cache(
  async (householdId: string, startDate: string, endDate: string): Promise<IncomeStatementRow[]> => {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc("report_income_statement", {
      p_household_id: householdId,
      p_from: startDate,
      p_to: endDate,
    });

    if (error || !data) return [];

    const rows = data as IncomeStatementDbRow[];
    return rows.map((r: IncomeStatementDbRow) => ({
      accountId: r.account_id,
      code: r.code,
      name: r.name,
      class: r.class,
      total: Number(r.amount) || 0,
    }));
  }
);

export const getGeneralLedger = cache(
  async (
    accountId: string,
    startDate: string,
    endDate: string
  ): Promise<GeneralLedgerRow[]> => {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc("report_general_ledger", {
      p_account_id: accountId,
      p_from: startDate,
      p_to: endDate,
    });

    if (error || !data) return [];

    const rows = data as GeneralLedgerDbRow[];
    return rows.map((r: GeneralLedgerDbRow) => ({
      entryId: r.entry_id,
      entryDate: r.entry_date,
      description: r.description,
      debit: Number(r.debit) || 0,
      credit: Number(r.credit) || 0,
      balanceChange: Number(r.balance_change) || 0,
    }));
  }
);
