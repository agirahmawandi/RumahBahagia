import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  getCurrentHousehold,
  getCurrentUser,
  getHouseholdMembers,
} from "@/lib/data/household";
import { getCategories } from "@/lib/data/accounts";
import { HouseholdSettings } from "@/components/features/settings/household-settings";
import { CategorySettings } from "@/components/features/settings/category-settings";
import { ProfileSettings } from "@/components/features/settings/profile-settings";

const TAB_TITLES: Record<string, { title: string; subtitle: string }> = {
  household: {
    title: "Buku Keuangan & Anggota",
    subtitle: "Atur nama buku keuangan keluarga dan kelola akses anggota.",
  },
  kategori: {
    title: "Kategori Pemasukan & Pengeluaran",
    subtitle: "Daftar kategori transaksi yang terhubung langsung ke COA akuntansi.",
  },
  anggaran: {
    title: "Anggaran Bulanan (Budget)",
    subtitle: "Atur batas pengeluaran bulanan per kategori dan pantau batas aman.",
  },
  profil: {
    title: "Profil Pengguna",
    subtitle: "Perbarui identitas profil dan informasi akun Anda.",
  },
};

export default async function PengaturanTabPage({
  params,
}: {
  params: Promise<{ tab: string }>;
}) {
  const { tab } = await params;
  const household = await getCurrentHousehold();
  const user = await getCurrentUser();

  if (!household || !user) {
    redirect("/onboarding");
  }

  const info = TAB_TITLES[tab] ?? {
    title: "Pengaturan",
    subtitle: "Pengaturan aplikasi RumahBahagia.",
  };

  let content = null;

  if (tab === "household") {
    const members = await getHouseholdMembers(household.id);
    content = <HouseholdSettings household={household} members={members} />;
  } else if (tab === "kategori") {
    const categories = await getCategories(household.id);
    content = <CategorySettings categories={categories} />;
  } else if (tab === "profil") {
    content = <ProfileSettings user={user} householdName={household.name} />;
  } else {
    const categories = await getCategories(household.id, "expense");
    content = (
      <div className="rounded-[12px] border border-line bg-white p-6 space-y-4">
        <h3 className="font-display text-lg font-bold text-ink">
          Alokasi Anggaran Bulanan
        </h3>
        <p className="font-body text-xs text-ink-muted">
          Pantau batas aman belanja 80% per kategori pengeluaran.
        </p>
        <div className="space-y-3 divide-y divide-line/60">
          {categories.map((c) => (
            <div key={c.id} className="pt-3 first:pt-0 flex items-center justify-between">
              <span className="font-ui text-sm font-bold text-ink">{c.name}</span>
              <span className="font-body text-xs text-ink-muted">Belum ada batas nominal</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

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

      {content}
    </div>
  );
}
