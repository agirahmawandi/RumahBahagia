"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createHouseholdAction(formData: FormData) {
  const name = formData.get("name") as string;
  const type = (formData.get("type") as "personal" | "family") || "family";

  if (!name || name.trim().length === 0) {
    return { error: "Nama buku keuangan wajib diisi." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_household", {
    p_name: name.trim(),
    p_type: type,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function switchHouseholdAction(householdId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Tidak terautentikasi." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ default_household_id: householdId })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function inviteMemberAction(
  householdId: string,
  email: string,
  role: "editor" | "viewer" = "editor"
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Tidak terautentikasi." };
  }

  const { data, error } = await supabase
    .from("household_invitations")
    .insert({
      household_id: householdId,
      email: email.trim().toLowerCase(),
      role,
      invited_by: user.id,
    })
    .select("token")
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/pengaturan", "page");
  return { success: true, token: data.token };
}

export async function acceptInvitationAction(token: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("accept_invitation", {
    p_token: token,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

