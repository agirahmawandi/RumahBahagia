import Link from "next/link";
import { Tags, Target, UserCircle, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";

const SETTINGS_SECTIONS = [
  {
    slug: "household",
    title: "Buku Keuangan & Anggota Keluarga",
    desc: "Atur nama buku keuangan (Household), undang pasangan/anggota via email, dan kelola peran (Owner, Editor, Viewer).",
    icon: Users,
  },
  {
    slug: "kategori",
    title: "Kategori Pemasukan & Pengeluaran",
    desc: "Tambah, ubah ikon/warna, atau arsipkan kategori serta sub-kategori transaksi.",
    icon: Tags,
  },
  {
    slug: "anggaran",
    title: "Anggaran Bulanan (Budget)",
    desc: "Tetapkan batas anggaran per kategori pengeluaran dan aktifkan pengingat otomatis saat melampaui 80%.",
    icon: Target,
  },
  {
    slug: "profil",
    title: "Profil & Keamanan Akun",
    desc: "Perbarui nama lengkap, foto profil, buku keuangan default, dan pengaturan kata sandi.",
    icon: UserCircle,
  },
];

export default function PengaturanPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        badge="Konfigurasi"
        title="Pengaturan"
        subtitle="Kelola buku keuangan keluarga, anggota, kategori COA, anggaran bulanan, dan profil Anda."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {SETTINGS_SECTIONS.map((sec) => {
          const Icon = sec.icon;
          return (
            <Link key={sec.slug} href={`/pengaturan/${sec.slug}`}>
              <Card className="h-full hover:border-teal transition-colors">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-cream border border-line text-teal-700">
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-bold text-ink">
                      {sec.title}
                    </h2>
                    <p className="mt-1 font-body text-sm text-ink-muted">
                      {sec.desc}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

