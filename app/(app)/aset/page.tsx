import { Home, Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function AsetPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        badge="Aset Tetap & Non-Kas"
        title="Aset Keluarga"
        subtitle="Catat properti/rumah, kendaraan, tanah, logam mulia, atau elektronik beserta nilai perolehan dan nilai pasar saat ini."
        actions={
          <Button variant="primary">
            <Plus className="h-4 w-4" />
            <span>Tambah Aset</span>
          </Button>
        }
      />

      <EmptyState
        icon={Home}
        title="Belum Ada Aset Terdaftar"
        description="Masukkan aset tetap keluarga Anda agar laporan Neraca dan perhitungan Kekayaan Bersih (Net Worth) tercatat utuh."
        actionLabel="+ Daftarkan Aset Pertama"
      />
    </div>
  );
}

