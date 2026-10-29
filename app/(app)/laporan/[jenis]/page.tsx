import Link from "next/link";
import { ArrowLeft, FileBarChart2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

const REPORT_TITLES: Record<string, { title: string; subtitle: string }> = {
  neraca: {
    title: "Laporan Neraca (Balance Sheet)",
    subtitle: "Posisi Aset, Liabilitas, dan Kekayaan Bersih (Ekuitas) keluarga.",
  },
  "surplus-defisit": {
    title: "Laporan Surplus / Defisit",
    subtitle: "Ringkasan Pemasukan dan Pengeluaran keluarga per kategori.",
  },
  "arus-kas": {
    title: "Laporan Arus Kas (Cash Flow)",
    subtitle: "Mutasi kas masuk dan keluar pada seluruh akun Kas & Bank.",
  },
  "buku-besar": {
    title: "Buku Besar (General Ledger)",
    subtitle: "Rincian transaksi dan saldo berjalan per akun COA.",
  },
  jurnal: {
    title: "Jurnal Umum (Mode Akuntan)",
    subtitle: "Seluruh entri jurnal double-entry (Debit = Kredit).",
  },
};

export default async function LaporanDetailPage({
  params,
}: {
  params: Promise<{ jenis: string }>;
}) {
  const { jenis } = await params;
  const info = REPORT_TITLES[jenis] ?? {
    title: "Detail Laporan",
    subtitle: "Laporan keuangan keluarga RumahBahagia.",
  };

  return (
    <div className="space-y-6">
      <PageHeader
        badge="Laporan Keuangan"
        title={info.title}
        subtitle={info.subtitle}
        actions={
          <Link href="/laporan">
            <Button variant="secondary" size="sm">
              <ArrowLeft className="h-4 w-4" />
              <span>Kembali ke Daftar Laporan</span>
            </Button>
          </Link>
        }
      />

      <EmptyState
        icon={FileBarChart2}
        title={`Belum Ada Data untuk ${info.title}`}
        description="Laporan ini akan terisi secara otomatis begitu Anda mencatat saldo awal rekening atau transaksi harian."
      />
    </div>
  );
}

