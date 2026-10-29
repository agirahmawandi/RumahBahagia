"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export async function createLiabilityAction(formData: FormData) {
  const householdId = formData.get("householdId") as string;
  const name = formData.get("name") as string;
  const type = (formData.get("type") as Database["public"]["Enums"]["liability_type"]) || "personal_loan";
  const lender = (formData.get("lender") as string) || null;
  const principal = Number(formData.get("principal")) || 0;
  const interestRate = Number(formData.get("interestRate")) || 0;
  const tenorMonths = Number(formData.get("tenorMonths")) || 0;
  const installmentAmount = Number(formData.get("installmentAmount")) || 0;
  const accountId = (formData.get("accountId") as string) || null;

  if (!householdId || !name || principal <= 0) {
    return { error: "Nama utang/pinjaman dan nominal pokok wajib diisi." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_liability", {
    p_household_id: householdId,
    p_name: name.trim(),
    p_type: type,
    p_lender: lender?.trim() || null,
    p_principal: principal,
    p_interest_rate: interestRate,
    p_tenor_months: tenorMonths,
    p_installment_amount: installmentAmount,
    p_account_id: accountId || null,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/utang");
  revalidatePath("/dashboard");
  revalidatePath("/rekening");
  return { success: true, id: data };
}

export async function recordLiabilityPaymentAction(formData: FormData) {
  const liabilityId = formData.get("liabilityId") as string;
  const accountId = formData.get("accountId") as string;
  const principalAmount = Number(formData.get("principalAmount")) || 0;
  const interestAmount = Number(formData.get("interestAmount")) || 0;
  const date = (formData.get("date") as string) || new Date().toISOString().substring(0, 10);
  const note = (formData.get("note") as string) || "Bayar cicilan";

  if (!liabilityId || !accountId || (principalAmount + interestAmount <= 0)) {
    return { error: "Rekening sumber dan nominal cicilan wajib diisi valid." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("record_liability_payment", {
    p_liability_id: liabilityId,
    p_account_id: accountId,
    p_principal_amount: principalAmount,
    p_interest_amount: interestAmount,
    p_date: date,
    p_note: note.trim(),
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/utang");
  revalidatePath("/dashboard");
  revalidatePath("/rekening");
  return { success: true, id: data };
}
