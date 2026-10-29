"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export async function createAssetAction(formData: FormData) {
  const householdId = formData.get("householdId") as string;
  const name = formData.get("name") as string;
  const category = (formData.get("category") as Database["public"]["Enums"]["asset_category"]) || "property";
  const cost = Number(formData.get("cost")) || 0;
  const accountId = (formData.get("accountId") as string) || null;
  const acquiredDate = (formData.get("acquiredDate") as string) || new Date().toISOString().substring(0, 10);
  const notes = (formData.get("notes") as string) || null;

  if (!householdId || !name) {
    return { error: "Nama aset dan buku keuangan wajib diisi." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_asset", {
    p_household_id: householdId,
    p_name: name.trim(),
    p_category: category,
    p_cost: cost,
    p_account_id: accountId || null,
    p_acquired_date: acquiredDate,
    p_notes: notes?.trim() || null,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/aset");
  revalidatePath("/dashboard");
  revalidatePath("/rekening");
  return { success: true, id: data };
}
