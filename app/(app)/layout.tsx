import React from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import {
  getCurrentUser,
  getCurrentHousehold,
  getUserHouseholds,
} from "@/lib/data/household";

export default async function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // Jika belum login, middleware sudah me-redirect, tapi sebagai fallback:
  if (!user) {
    redirect("/login");
  }

  const [currentHousehold, userHouseholds] = await Promise.all([
    getCurrentHousehold(),
    getUserHouseholds(),
  ]);

  // Jika user belum punya buku keuangan apa pun, arahkan ke onboarding
  if (!currentHousehold) {
    redirect("/onboarding");
  }

  return (
    <AppShell
      currentUser={user}
      currentHousehold={currentHousehold}
      userHouseholds={userHouseholds}
    >
      {children}
    </AppShell>
  );
}
