import Link from "next/link";
import {
  ArrowRight,
  PiggyBank,
  ShieldCheck,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, HeroCard } from "@/components/ui/card";
import { formatRupiah } from "@/lib/format";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-cream-50 text-ink flex flex-col">
      {/* Navbar */}
      <header className="border-b border-line bg-cream/60 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-teal font-display text-xl font-bold text-ink shadow-xs">
              RB
            </div>
            <div>
              <span className="font-display text-lg font-bold text-ink block leading-none">
                RumahBahagia
              </span>
              <span className="font-ui text-[11px] font-semibold text-ink-muted">
                Catatan Keuangan Keluarga
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href="/login">
              <Button variant="secondary" size="sm">
                Masuk
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="primary" size="sm">
                Buka Dashboard
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="mx-auto flex-1 max-w-[1280px] px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7 space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-teal-50 border border-teal/30 px-3.5 py-1 font-ui text-xs font-bold text-teal-700">
              ✨ Akuntansi Double-Entry Skala Rumah Tangga
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-ink leading-[1.1]">
              Kelola Keuangan Keluarga, Rapi Seperti Perusahaan, Hangat Seperti Rumah.
            </h1>
            <p className="font-body text-lg text-ink-muted max-w-2xl">
              Catat pemasukan, pengeluaran, tabungan impian, investasi, hingga aset &amp; cicilan dalam satu buku keuangan bersama pasangan—tanpa perlu pusing istilah debit &amp; kredit.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link href="/dashboard">
                <Button variant="primary" size="lg">
                  Lihat Dashboard Aplikasi
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="secondary" size="lg">
                  Daftar Buku Keluarga Baru
                </Button>
              </Link>
            </div>
          </div>

          {/* Preview Card */}
          <div className="lg:col-span-5 space-y-4">
            <HeroCard>
              <span className="font-ui text-xs font-bold uppercase tracking-wider text-ink/80">
                Contoh Posisi Kekayaan Bersih (Net Worth)
              </span>
              <p className="mt-1 tabular-money text-4xl font-bold text-ink">
                {formatRupiah(185_450_000)}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3 rounded-[12px] bg-white/80 p-3 backdrop-blur-xs">
                <div>
                  <span className="font-ui text-[11px] font-bold text-teal-700">
                    ↑ Pemasukan Bulan Ini
                  </span>
                  <p className="tabular-money text-lg font-bold text-ink">
                    {formatRupiah(18_500_000)}
                  </p>
                </div>
                <div>
                  <span className="font-ui text-[11px] font-bold text-flame-700">
                    ↓ Pengeluaran Bulan Ini
                  </span>
                  <p className="tabular-money text-lg font-bold text-flame-700">
                    {formatRupiah(9_250_000)}
                  </p>
                </div>
              </div>
            </HeroCard>

            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4">
                <Wallet className="h-5 w-5 text-teal-700 mb-2" />
                <p className="font-ui text-xs font-bold text-ink">Multi-Rekening</p>
                <p className="font-body text-xs text-ink-muted mt-0.5">
                  Cash, Bank, E-Wallet, Kartu Kredit
                </p>
              </Card>
              <Card className="p-4">
                <PiggyBank className="h-5 w-5 text-peach mb-2" />
                <p className="font-ui text-xs font-bold text-ink">Pos Tabungan</p>
                <p className="font-body text-xs text-ink-muted mt-0.5">
                  Dana Darurat, Pendidikan, Liburan
                </p>
              </Card>
              <Card className="p-4">
                <TrendingUp className="h-5 w-5 text-teal-700 mb-2" />
                <p className="font-ui text-xs font-bold text-ink">Portofolio &amp; Aset</p>
                <p className="font-body text-xs text-ink-muted mt-0.5">
                  Pantau investasi &amp; laporan Neraca
                </p>
              </Card>
              <Card className="p-4">
                <Users className="h-5 w-5 text-flame mb-2" />
                <p className="font-ui text-xs font-bold text-ink">Kolaborasi Keluarga</p>
                <p className="font-body text-xs text-ink-muted mt-0.5">
                  Peran Owner, Editor &amp; Viewer
                </p>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-line bg-cream py-6">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 font-ui text-xs text-ink-muted">
          <span>© 2026 RumahBahagia — Catatan Keuangan Keluarga</span>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-teal-700" />
            Dilindungi Row-Level Security (RLS) Supabase
          </span>
        </div>
      </footer>
    </div>
  );
}
