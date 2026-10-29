import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export interface CurrentHousehold {
  id: string;
  name: string;
  type: "personal" | "family";
  role: "owner" | "editor" | "viewer";
  created_by: string;
}

export interface UserHouseholdSummary {
  id: string;
  name: string;
  type: "personal" | "family";
  role: "owner" | "editor" | "viewer";
}

export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return {
    id: user.id,
    email: user.email,
    fullName: profile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "Pengguna",
    avatarUrl: profile?.avatar_url || null,
    defaultHouseholdId: profile?.default_household_id || null,
  };
});

export const getCurrentHousehold = cache(async (): Promise<CurrentHousehold | null> => {
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user) return null;

  // 1. Coba ambil berdasarkan default_household_id
  if (user.defaultHouseholdId) {
    const { data: member } = await supabase
      .from("household_members")
      .select("role, households (id, name, type, created_by)")
      .eq("household_id", user.defaultHouseholdId)
      .eq("user_id", user.id)
      .single();

    if (member && member.households) {
      const h = member.households as unknown as { id: string; name: string; type: "personal" | "family"; created_by: string };
      return {
        id: h.id,
        name: h.name,
        type: h.type,
        role: member.role as "owner" | "editor" | "viewer",
        created_by: h.created_by,
      };
    }
  }

  // 2. Jika default belum terpasang atau tidak valid, ambil household pertama di mana user terdaftar
  const { data: firstMembership } = await supabase
    .from("household_members")
    .select("role, household_id, households (id, name, type, created_by)")
    .eq("user_id", user.id)
    .order("joined_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (firstMembership && firstMembership.households) {
    const h = firstMembership.households as unknown as { id: string; name: string; type: "personal" | "family"; created_by: string };
    
    // Simpan ke profiles sebagai default
    await supabase
      .from("profiles")
      .update({ default_household_id: h.id })
      .eq("id", user.id);

    return {
      id: h.id,
      name: h.name,
      type: h.type,
      role: firstMembership.role as "owner" | "editor" | "viewer",
      created_by: h.created_by,
    };
  }

  return null;
});

export const getUserHouseholds = cache(async (): Promise<UserHouseholdSummary[]> => {
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user) return [];

  const { data } = await supabase
    .from("household_members")
    .select("role, households (id, name, type)")
    .eq("user_id", user.id)
    .order("joined_at", { ascending: true });

  if (!data) return [];

  return data
    .filter((m) => m.households !== null)
    .map((m) => {
      const h = m.households as unknown as { id: string; name: string; type: "personal" | "family" };
      return {
        id: h.id,
        name: h.name,
        type: h.type,
        role: m.role as "owner" | "editor" | "viewer",
      };
    });
});

export const getHouseholdMembers = cache(async (householdId: string) => {
  const supabase = await createClient();

  const { data } = await supabase
    .from("household_members")
    .select("id, role, joined_at, profiles (id, full_name, avatar_url)")
    .eq("household_id", householdId);

  if (!data) return [];

  return data.map((m) => {
    const p = m.profiles as unknown as { id: string; full_name: string | null; avatar_url: string | null };
    return {
      id: m.id,
      role: m.role,
      joinedAt: m.joined_at,
      userId: p?.id,
      fullName: p?.full_name || "Anggota",
      avatarUrl: p?.avatar_url,
    };
  });
});

