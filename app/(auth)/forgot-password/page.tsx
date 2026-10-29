"use client";

import React, { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { forgotPasswordAction } from "@/app/(auth)/actions";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await forgotPasswordAction(formData);

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success(result?.success || "Tautan reset telah dikirim!");
      setSent(true);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="font-display text-2xl font-bold text-ink">
            Reset Kata Sandi
          </h1>
          <p className="font-body text-sm text-ink-muted">
            {sent
              ? "Silakan periksa kotak masuk email Anda untuk tautan pemulihan."
              : "Masukkan email yang terdaftar untuk menerima tautan pemulihan kata sandi."}
          </p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-4">
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

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Mengirim..." : "Kirim Tautan Reset"}
            </Button>
          </form>
        ) : (
          <div className="rounded-[12px] bg-teal-50 border border-teal/30 p-4 text-center font-ui text-sm text-teal-700">
            Email terkirim! Silakan periksa inbox atau spam.
          </div>
        )}

        <p className="text-center font-body text-sm text-ink-muted">
          <Link
            href="/login"
            className="font-ui font-bold text-teal-700 hover:underline"
          >
            ← Kembali ke halaman Masuk
          </Link>
        </p>
      </Card>
    </div>
  );
}
