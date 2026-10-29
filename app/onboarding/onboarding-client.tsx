"use client";

import React, { useState } from "react";
import { Users, User } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { createHouseholdAction } from "@/app/actions/household";

export function OnboardingClient() {
  const [householdType, setHouseholdType] = useState<"family" | "personal">("family");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("type", householdType);

    const result = await createHouseholdAction(formData);

    if (result?.error) {
      toast.error(result.error);
      setLoading(false);
    } else {
      toast.success("Buku keuangan berhasil dibuat! Selamat datang di RumahBahagia.");
    }
  }

  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg p-6 sm:p-8 space-y-6">
        <div className="space-y-2">
          <span className="inline-block rounded-full bg-teal-50 border border-teal/30 px-3 py-0.5 font-ui text-xs font-bold text-teal-700">
            Langkah 1 dari 1 · Siapkan Buku Keuangan
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink">
            Selamat Datang di RumahBahagia
          </h1>
          <p className="font-body text-sm text-ink-muted">
            Pilih jenis buku keuangan dan beri nama buku Anda. Sistem akan otomatis menyiapkan struktur akun (COA) dan kategori bawaan.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setHouseholdType("family")}
              className={`flex flex-col items-start gap-2 rounded-[12px] p-4 text-left cursor-pointer transition-colors ${
                householdType === "family"
                  ? "border-2 border-teal bg-teal-50/70"
                  : "border border-line bg-white hover:bg-cream/40"
              }`}
            >
              <Users
                className={`h-6 w-6 ${
                  householdType === "family" ? "text-teal-700" : "text-ink-muted"
                }`}
                strokeWidth={1.75}
              />
              <div>
                <p className="font-ui text-sm font-bold text-ink">Keluarga</p>
                <p className="font-body text-xs text-ink-muted">
                  Bisa dipakai bersama pasangan &amp; anggota
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setHouseholdType("personal")}
              className={`flex flex-col items-start gap-2 rounded-[12px] p-4 text-left cursor-pointer transition-colors ${
                householdType === "personal"
                  ? "border-2 border-teal bg-teal-50/70"
                  : "border border-line bg-white hover:bg-cream/40"
              }`}
            >
              <User
                className={`h-6 w-6 ${
                  householdType === "personal" ? "text-teal-700" : "text-ink-muted"
                }`}
                strokeWidth={1.75}
              />
              <div>
                <p className="font-ui text-sm font-bold text-ink">Pribadi</p>
                <p className="font-body text-xs text-ink-muted">
                  Satu pengguna untuk keuangan personal
                </p>
              </div>
            </button>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="household-name">Nama Buku Keuangan</Label>
            <Input
              id="household-name"
              name="name"
              placeholder="Contoh: Keluarga Budi & Siti"
              defaultValue={householdType === "family" ? "Keluarga Bahagia" : "Keuangan Pribadi"}
              required
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full pt-1"
            disabled={loading}
          >
            {loading ? "Menyiapkan Buku..." : "Selesaikan & Buka Dashboard →"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

