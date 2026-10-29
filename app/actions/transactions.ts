"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createCashAccountAction(formData: FormData) {
  const householdId = formData.get("householdId") as string;
  const name = formData.get("name") as string;
  const type = (formData.get("type") as "cash" | "bank" | "ewallet" | "credit_card") || "bank";
  const openingBalance = Number(formData.get("openingBalance") || 0);
  const institution = (formData.get("institution") as string) || null;
  const last4 = (formData.get("accountNumberLast4") as string) || null;
  const color = (formData.get("color") as string) || "#00CEC8";
  const icon = (formData.get("icon") as string) || "wallet";
  const creditLimit = Number(formData.get("creditLimit") || 0);

  if (!householdId || !name) {
    return { error: "Nama rekening dan buku keuangan wajib diisi." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_cash_account", {
    p_household_id: householdId,
    p_name: name.trim(),
    p_type: type,
    p_opening_balance: openingBalance,
    p_institution: institution,
    p_account_number_last4: last4,
    p_color: color,
    p_icon: icon,
    p_credit_limit: creditLimit,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true, accountId: data };
}

export async function recordIncomeAction(data: {
  householdId: string;
  date: string;
  amount: number;
  categoryId: string;
  accountId: string;
  description: string;
  tags?: string[];
}) {
  const supabase = await createClient();
  const { data: res, error } = await supabase.rpc("record_income", {
    p_household_id: data.householdId,
    p_date: data.date,
    p_amount: data.amount,
    p_category_id: data.categoryId,
    p_account_id: data.accountId,
    p_description: data.description,
    p_tags: data.tags || [],
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true, entryId: res };
}

export async function recordExpenseAction(data: {
  householdId: string;
  date: string;
  amount: number;
  categoryId: string;
  accountId: string;
  description: string;
  tags?: string[];
}) {
  const supabase = await createClient();
  const { data: res, error } = await supabase.rpc("record_expense", {
    p_household_id: data.householdId,
    p_date: data.date,
    p_amount: data.amount,
    p_category_id: data.categoryId,
    p_account_id: data.accountId,
    p_description: data.description,
    p_tags: data.tags || [],
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true, entryId: res };
}

export async function recordTransferAction(data: {
  householdId: string;
  date: string;
  amount: number;
  fromAccountId: string;
  toAccountId: string;
  adminFee?: number;
  description?: string;
}) {
  const supabase = await createClient();
  const { data: res, error } = await supabase.rpc("record_transfer", {
    p_household_id: data.householdId,
    p_date: data.date,
    p_amount: data.amount,
    p_from_account_id: data.fromAccountId,
    p_to_account_id: data.toAccountId,
    p_admin_fee: data.adminFee || 0,
    p_description: data.description || "Transfer dana",
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true, entryId: res };
}

export async function createSavingsGoalAction(data: {
  householdId: string;
  name: string;
  targetAmount: number;
  targetDate?: string;
  description?: string;
  icon?: string;
  color?: string;
}) {
  const supabase = await createClient();
  const { data: res, error } = await supabase.rpc("create_savings_goal", {
    p_household_id: data.householdId,
    p_name: data.name,
    p_target_amount: data.targetAmount,
    p_target_date: data.targetDate || undefined,
    p_description: data.description || undefined,
    p_icon: data.icon || "piggy-bank",
    p_color: data.color || "#00CEC8",
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true, goalId: res };
}

export async function savingDepositAction(data: {
  goalId: string;
  accountId: string;
  amount: number;
  date?: string;
  note?: string;
}) {
  const supabase = await createClient();
  const { data: res, error } = await supabase.rpc("saving_deposit", {
    p_goal_id: data.goalId,
    p_account_id: data.accountId,
    p_amount: data.amount,
    p_date: data.date,
    p_note: data.note || "Setor tabungan",
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true, entryId: res };
}

export async function savingWithdrawAction(data: {
  goalId: string;
  accountId: string;
  amount: number;
  date?: string;
  note?: string;
}) {
  const supabase = await createClient();
  const { data: res, error } = await supabase.rpc("saving_withdraw", {
    p_goal_id: data.goalId,
    p_account_id: data.accountId,
    p_amount: data.amount,
    p_date: data.date,
    p_note: data.note || "Tarik tabungan",
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true, entryId: res };
}

