import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowUpRight,
  PiggyBank,
  Plus,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle, HeroCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SavingsProgress } from "@/components/ui/progress";
import { formatRupiah, formatTanggal } from "@/lib/format";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        badge="Ringkasan Keluarga"
        title="Dashboard Keuangan"
        subtitle="Pantau posisi kekayaan bersih, arus kas bulan ini, dan progres tabungan keluarga Anda."
        actions={
          <Link href="/rekening">
            <Button variant="secondary" size="sm">
              <Plus className="h-4 w-4" />
              <span>Tambah Rekening</span>
            </Button>
          </Link>
        }
      />

      {/* Top Row: Net Worth + Key Metrics */}
      <div className="grid gap-4 lg:grid-cols-12">
        <HeroCard className="lg:col-span-5 flex flex-col justify-between">
          <div>
            <span className="font-ui text-xs font-bold uppercase tracking-wider text-ink/80">
              Total Kekayaan Bersih (Aset − Utang)
            </span>
            <p className="mt-2 tabular-money text-4xl font-bold text-ink">
              {formatRupiah(0)}
            </p>
            <p className="mt-1 font-body text-xs text-ink/80">
              Per {formatTanggal(new Date())} · Buku: Keluarga Bahagia
            </p>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 rounded-[12px] bg-white/85 p-3.5">
            <div>
              <span className="font-ui text-[11px] font-bold text-teal-700">
                Total Aset
              </span>
              <p className="tabular-money text-lg font-bold text-ink">
                {formatRupiah(0)}
              </p>
            </div>
            <div>
              <span className="font-ui text-[11px] font-bold text-flame-700">
                Total Liabilitas
              </span>
              <p className="tabular-money text-lg font-bold text-flame-700">
                {formatRupiah(0)}
              </p>
            </div>
          </div>
        </HeroCard>

        <div className="lg:col-span-7 grid gap-4 sm:grid-cols-3">
          <Card className="flex flex-col justify-between">
            <CardHeader className="pb-1">
              <CardTitle>Total Kas &amp; Bank</CardTitle>
              <Wallet className="h-5 w-5 text-teal-700" strokeWidth={1.75} />
            </CardHeader>
            <div>
              <p className="tabular-money text-2xl sm:text-3xl font-bold text-ink">
                {formatRupiah(0)}
              </p>
              <p className="mt-1 font-body text-xs text-ink-muted">
                0 rekening aktif
              </p>
            </div>
          </Card>

          <Card className="flex flex-col justify-between">
            <CardHeader className="pb-1">
              <CardTitle>Pemasukan Bulan Ini</CardTitle>
              <ArrowDownLeft className="h-5 w-5 text-teal-700" strokeWidth={2} />
            </CardHeader>
            <div>
              <p className="tabular-money text-2xl sm:text-3xl font-bold text-teal-700">
                +{formatRupiah(0)}
              </p>
              <Badge variant="income" className="mt-2">
                ↑ Oktober 2026
              </Badge>
            </div>
          </Card>

          <Card className="flex flex-col justify-between">
            <CardHeader className="pb-1">
              <CardTitle>Pengeluaran Bulan Ini</CardTitle>
              <ArrowUpRight className="h-5 w-5 text-flame" strokeWidth={2} />
            </CardHeader>
            <div>
              <p className="tabular-money text-2xl sm:text-3xl font-bold text-flame-700">
                {formatRupiah(0)}
              </p>
              <Badge variant="expense" className="mt-2">
                ↓ Oktober 2026
              </Badge>
            </div>
          </Card>
        </div>
      </div>

      {/* Second Row: Pos Tabungan & Transaksi Terakhir */}
      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PiggyBank className="h-5 w-5 text-teal-700" />
              <h2 className="font-display text-xl font-bold text-ink">
                Progres Pos Tabungan
              </h2>
            </div>
            <Link
              href="/tabungan"
              className="font-ui text-xs font-bold text-teal-700 hover:underline"
            >
              Kelola Pos →
            </Link>
          </div>

          <div className="rounded-[12px] border border-line bg-cream-50 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-ui text-sm font-bold text-ink">
                Dana Darurat Keluarga (Contoh)
              </span>
              <span className="tabular-money text-sm font-bold text-ink">
                {formatRupiah(0)} / {formatRupiah(30_000_000, { compact: true })}
              </span>
            </div>
            <SavingsProgress current={0} target={30_000_000} />
          </div>
        </Card>

        <Card className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-peach" />
              <h2 className="font-display text-xl font-bold text-ink">
                Transaksi Terakhir
              </h2>
            </div>
            <Link
              href="/pengeluaran"
              className="font-ui text-xs font-bold text-teal-700 hover:underline"
            >
              Lihat Semua →
            </Link>
          </div>

          <div className="rounded-[12px] border border-dashed border-line bg-cream-50/60 p-6 text-center">
            <p className="font-ui text-sm font-bold text-ink">
              Belum ada transaksi tercatat
            </p>
            <p className="mt-1 font-body text-xs text-ink-muted">
              Mulai dengan menambahkan rekening pertama Anda, lalu catat pemasukan atau pengeluaran harian.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

