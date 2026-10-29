"use client";

import React, { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { registerAction } from "@/app/(auth)/actions";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await registerAction(formData);

    if (result?.error) {
      toast.error(result.error);
      setLoading(false);
    } else {
      toast.success("Akun berhasil dibuat! Mengalihkan ke onboarding...");
    }
  }

  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <Link
            href="/"
            className="mx-auto flex h-12 w-12 items-center justify-center rounded-[12px] bg-teal font-display text-2xl font-bold text-ink shadow-xs"
          >
            RB
          </Link>
          <h1 className="font-display text-2xl font-bold text-ink">
            Buat Akun RumahBahagia
          </h1>
          <p className="font-body text-sm text-ink-muted">
            Mulai pembukuan keuangan pribadi atau keluarga Anda hari ini.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="font-ui text-xs font-bold text-ink">
              Nama Lengkap
            </label>
            <Input
              name="fullName"
              type="text"
              placeholder="Budi Santoso"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-ui text-xs font-bold text-ink">
              Alamat Email
            </label>
            <Input
              name="email"
              type="email"
              placeholder="nama@email.com"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-ui text-xs font-bold text-ink">
              Kata Sandi
            </label>
            <Input
              name="password"
              type="password"
              placeholder="Minimal 6 karakter"
              required
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-2"
            disabled={loading}
          >
            {loading ? "Membuat Akun..." : "Daftar & Buat Buku Keuangan"}
          </Button>
        </form>

        <p className="text-center font-body text-sm text-ink-muted">
          Sudah punya akun?{" "}
          <Link
            href="/login"
            className="font-ui font-bold text-teal-700 hover:underline"
          >
            Masuk di sini
          </Link>
        </p>
      </Card>
    </div>
  );
}
