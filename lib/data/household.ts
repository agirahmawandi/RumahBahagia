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

interface MembershipRow {
  role: string;
  household_id: string;
  households: {
    id: string;
    name: string;
    type: "personal" | "family";
    created_by: string;
  } | null;
}

const getUserMemberships = cache(async (userId: string): Promise<MembershipRow[]> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("household_members")
    .select("role, household_id, households (id, name, type, created_by)")
    .eq("user_id", userId)
    .order("joined_at", { ascending: true });

  return (data as unknown as MembershipRow[]) || [];
});

export const getCurrentHousehold = cache(async (): Promise<CurrentHousehold | null> => {
  const user = await getCurrentUser();
  if (!user) return null;

  const memberships = await getUserMemberships(user.id);
  if (!memberships || memberships.length === 0) return null;

  // 1. Coba ambil berdasarkan default_household_id
  let match = user.defaultHouseholdId
    ? memberships.find((m) => m.household_id === user.defaultHouseholdId)
    : null;

  // 2. Jika default belum terpasang atau tidak valid, ambil keanggotaan pertama
  if (!match) {
    match = memberships[0];
    if (match.household_id) {
      const supabase = await createClient();
      await supabase
        .from("profiles")
        .update({ default_household_id: match.household_id })
        .eq("id", user.id);
    }
  }

  const h = match.households;
  if (!h) return null;

  return {
    id: h.id,
    name: h.name,
    type: h.type,
    role: match.role as "owner" | "editor" | "viewer",
    created_by: h.created_by,
  };
});

export const getUserHouseholds = cache(async (): Promise<UserHouseholdSummary[]> => {
  const user = await getCurrentUser();
  if (!user) return [];

  const memberships = await getUserMemberships(user.id);
  return memberships
    .filter((m) => m.households !== null)
    .map((m) => {
      const h = m.households!;
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

