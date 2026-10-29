"use client";

import React from "react";
import { ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ProfileSettingsProps {
  user: {
    id: string;
    email?: string;
    fullName: string;
    avatarUrl: string | null;
  };
  householdName: string;
}

export function ProfileSettings({ user, householdName }: ProfileSettingsProps) {
  return (
    <div className="space-y-6">
      <Card className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal font-display text-2xl font-bold text-ink">
            {user.fullName.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h3 className="font-display text-xl font-bold text-ink">
              {user.fullName}
            </h3>
            <p className="font-body text-sm text-ink-muted">{user.email}</p>
          </div>
        </div>

        <div className="pt-4 border-t border-line space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <span className="font-ui text-xs font-bold text-ink-muted">
                Nama Lengkap
              </span>
              <p className="mt-1 font-ui text-sm font-semibold text-ink">
                {user.fullName}
              </p>
            </div>
            <div>
              <span className="font-ui text-xs font-bold text-ink-muted">
                Email Akun
              </span>
              <p className="mt-1 font-ui text-sm font-semibold text-ink">
                {user.email}
              </p>
            </div>
            <div>
              <span className="font-ui text-xs font-bold text-ink-muted">
                Buku Keuangan Default
              </span>
              <p className="mt-1 font-ui text-sm font-semibold text-ink">
                {householdName}
              </p>
            </div>
            <div>
              <span className="font-ui text-xs font-bold text-ink-muted">
                Keamanan &amp; Autentikasi
              </span>
              <div className="mt-1 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-teal-700" />
                <span className="font-ui text-xs font-bold text-teal-700">
                  Supabase Auth Protected
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
