import { ArrowUpRight, Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

export default function PengeluaranPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        badge="Arus Kas Keluar"
        title="Pengeluaran"
        subtitle="Catat pengeluaran harian lengkap dengan kategori, rekening sumber, dan lampiran foto struk."
        actions={
          <Button variant="danger">
            <Plus className="h-4 w-4" />
            <span>Tambah Pengeluaran</span>
          </Button>
        }
      />

      <EmptyState
        icon={ArrowUpRight}
        title="Belum Ada Catatan Pengeluaran"
        description="Pantau ke mana perginya uang keluarga Anda setiap bulan dan dapatkan peringatan saat anggaran kategori melampaui 80%."
        actionLabel="+ Catat Pengeluaran Pertama"
      />
    </div>
  );
}

