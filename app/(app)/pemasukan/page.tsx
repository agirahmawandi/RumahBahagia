import { ArrowDownLeft, Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

export default function PemasukanPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        badge="Arus Kas Masuk"
        title="Pemasukan"
        subtitle="Catat semua sumber pemasukan keluarga (Gaji, Bonus, Hasil Usaha, Hadiah, dan lainnya)."
        actions={
          <Button variant="primary">
            <Plus className="h-4 w-4" />
            <span>Tambah Pemasukan</span>
          </Button>
        }
      />

      <EmptyState
        icon={ArrowDownLeft}
        title="Belum Ada Catatan Pemasukan"
        description="Setiap pemasukan yang Anda catat akan otomatis menambah saldo rekening tujuan dan tercatat pada laporan Surplus/Defisit."
        actionLabel="+ Catat Pemasukan Pertama"
      />
    </div>
  );
}

