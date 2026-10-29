import Link from "next/link";
import { ArrowLeft, Settings } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

const TAB_TITLES: Record<string, { title: string; subtitle: string }> = {
  household: {
    title: "Buku Keuangan & Anggota",
    subtitle: "Atur nama buku keuangan keluarga dan undang anggota baru.",
  },
  anggota: {
    title: "Anggota Keluarga",
    subtitle: "Kelola akses Owner, Editor, dan Viewer dalam buku keuangan ini.",
  },
  kategori: {
    title: "Kategori Pemasukan & Pengeluaran",
    subtitle: "Sesuaikan daftar kategori dan sub-kategori yang terhubung ke COA.",
  },
  anggaran: {
    title: "Anggaran Bulanan (Budget)",
    subtitle: "Atur batas pengeluaran bulanan per kategori.",
  },
  profil: {
    title: "Profil Pengguna",
    subtitle: "Perbarui informasi akun pribadi Anda.",
  },
};

export default async function PengaturanTabPage({
  params,
}: {
  params: Promise<{ tab: string }>;
}) {
  const { tab } = await params;
  const info = TAB_TITLES[tab] ?? {
    title: "Pengaturan",
    subtitle: "Pengaturan aplikasi RumahBahagia.",
  };

  return (
    <div className="space-y-6">
      <PageHeader
        badge="Pengaturan"
        title={info.title}
        subtitle={info.subtitle}
        actions={
          <Link href="/pengaturan">
            <Button variant="secondary" size="sm">
              <ArrowLeft className="h-4 w-4" />
              <span>Kembali</span>
            </Button>
          </Link>
        }
      />

      <EmptyState
        icon={Settings}
        title={info.title}
        description="Halaman pengaturan ini siap dihubungkan dengan database Supabase pada Fase F1–F3."
      />
    </div>
  );
}

