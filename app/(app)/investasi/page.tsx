import { Plus, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function InvestasiPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        badge="Portofolio Keluarga"
        title="Investasi"
        subtitle="Catat Reksa Dana, Saham, Emas, SBN/Obligasi, Deposito, atau Kripto dengan perhitungan rata-rata nilai pokok & untung/rugi."
        actions={
          <Button variant="primary">
            <Plus className="h-4 w-4" />
            <span>Tambah Instrumen</span>
          </Button>
        }
      />

      <EmptyState
        icon={TrendingUp}
        title="Belum Ada Portofolio Investasi"
        description="Catat transaksi beli, jual, dividen, dan perbarui nilai pasar secara berkala untuk memantau pertumbuhan aset investasi Anda."
        actionLabel="+ Tambah Instrumen Investasi"
      />
    </div>
  );
}

