"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export async function createInvestmentAction(formData: FormData) {
  const householdId = formData.get("householdId") as string;
  const name = formData.get("name") as string;
  const type = (formData.get("type") as Database["public"]["Enums"]["investment_type"]) || "mutual_fund";
  const platform = (formData.get("platform") as string) || null;
  const ticker = (formData.get("ticker") as string) || null;

  if (!householdId || !name) {
    return { error: "Nama investasi dan buku keuangan wajib diisi." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_investment", {
    p_household_id: householdId,
    p_name: name.trim(),
    p_type: type,
    p_platform: platform?.trim() || null,
    p_ticker: ticker?.trim() || null,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/investasi");
  revalidatePath("/dashboard");
  return { success: true, id: data };
}

export async function recordInvestmentBuyAction(formData: FormData) {
  const investmentId = formData.get("investmentId") as string;
  const accountId = formData.get("accountId") as string;
  const units = Number(formData.get("units")) || 0;
  const price = Number(formData.get("price")) || 0;
  const fee = Number(formData.get("fee")) || 0;
  const date = (formData.get("date") as string) || new Date().toISOString().substring(0, 10);

  if (!investmentId || !accountId || units <= 0 || price <= 0) {
    return { error: "Unit, harga, dan rekening sumber harus diisi valid." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("record_investment_buy", {
    p_investment_id: investmentId,
    p_account_id: accountId,
    p_units: units,
    p_price: price,
    p_fee: fee,
    p_date: date,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/investasi");
  revalidatePath("/dashboard");
  revalidatePath("/rekening");
  return { success: true, id: data };
}
