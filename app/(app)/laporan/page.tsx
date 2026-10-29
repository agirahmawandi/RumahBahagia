import Link from "next/link";
import {
  BookOpen,
  Download,
  FileBarChart2,
  FileSpreadsheet,
  Scale,
  ScrollText,
  TrendingUp,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const REPORT_CARDS = [
  {
    slug: "neraca",
    title: "Laporan Neraca (Balance Sheet)",
    desc: "Posisi Aset, Liabilitas (Utang), dan Ekuitas (Kekayaan Bersih) keluarga pada tanggal tertentu.",
    icon: Scale,
    badge: "Aset = Liabilitas + Ekuitas",
  },
  {
    slug: "surplus-defisit",
    title: "Laporan Surplus / Defisit (Laba-Rugi)",
    desc: "Ringkasan seluruh Pemasukan dikurangi Pengeluaran per kategori dalam satu periode.",
    icon: TrendingUp,
    badge: "Arus Operasional",
  },
  {
    slug: "arus-kas",
    title: "Laporan Arus Kas (Cash Flow)",
    desc: "Mutasi kas masuk dan keluar pada seluruh rekening Kas, Bank, dan E-Wallet.",
    icon: FileBarChart2,
    badge: "Mutasi Kas & Bank",
  },
  {
    slug: "buku-besar",
    title: "Buku Besar (General Ledger)",
    desc: "Rincian mutasi dan saldo berjalan untuk setiap akun dalam Chart of Accounts (COA).",
    icon: BookOpen,
    badge: "Drill-down per Akun",
  },
  {
    slug: "jurnal",
    title: "Jurnal Umum (Mode Akuntan)",
    desc: "Daftar seluruh ayat jurnal berpasangan (Debit = Kredit) otomatis maupun jurnal penyesuaian manual.",
    icon: ScrollText,
    badge: "Double-Entry Audit",
  },
];

export default function LaporanPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        badge="Standar Akuntansi"
        title="Laporan Keuangan"
        subtitle="Laporan keuangan keluarga setara standar perusahaan, dihasilkan otomatis dari mesin jurnal berpasangan."
        actions={
          <>
            <Button variant="secondary" size="sm">
              <FileSpreadsheet className="h-4 w-4" />
              <span>Ekspor CSV</span>
            </Button>
            <Button variant="primary" size="sm">
              <Download className="h-4 w-4" />
              <span>Unduh PDF</span>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        {REPORT_CARDS.map((rep) => {
          const Icon = rep.icon;
          return (
            <Link key={rep.slug} href={`/laporan/${rep.slug}`}>
              <Card className="h-full hover:border-teal transition-colors flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-cream px-2.5 py-0.5 font-ui text-[11px] font-bold text-ink">
                      {rep.badge}
                    </span>
                    <Icon className="h-5 w-5 text-teal-700" strokeWidth={1.75} />
                  </div>
                  <h2 className="mt-3 font-display text-xl font-bold text-ink">
                    {rep.title}
                  </h2>
                  <p className="mt-1 font-body text-sm text-ink-muted">
                    {rep.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-line/60 font-ui text-xs font-bold text-teal-700">
                  Buka Laporan →
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

