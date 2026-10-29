import { HandCoins, Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function UtangPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        badge="Liabilitas & Cicilan"
        title="Utang & Kewajiban"
        subtitle="Pantau KPR, cicilan kendaraan, atau pinjaman lainnya beserta pemisahan pembayaran pokok dan beban bunga."
        actions={
          <Button variant="primary">
            <Plus className="h-4 w-4" />
            <span>Catat Utang / Cicilan</span>
          </Button>
        }
      />

      <EmptyState
        icon={HandCoins}
        title="Tidak Ada Catatan Utang Aktif"
        description="Jika keluarga memiliki KPR atau cicilan, catat di sini untuk memantau sisa pokok pinjaman dan progres pelunasan."
        actionLabel="+ Tambah Catatan Utang"
      />
    </div>
  );
}

