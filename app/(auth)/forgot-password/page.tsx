import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="font-display text-2xl font-bold text-ink">
            Reset Kata Sandi
          </h1>
          <p className="font-body text-sm text-ink-muted">
            Masukkan email yang terdaftar untuk menerima tautan pemulihan kata sandi.
          </p>
        </div>

        <form className="space-y-4">
          <div className="space-y-1.5">
            <label className="font-ui text-xs font-bold text-ink">
              Alamat Email
            </label>
            <Input type="email" placeholder="nama@email.com" />
          </div>

          <Button type="button" variant="primary" className="w-full">
            Kirim Tautan Reset
          </Button>
        </form>

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

