import { PiggyBank, Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function TabunganPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        badge="Alokasi Tujuan"
        title="Pos Tabungan"
        subtitle="Buat pos tabungan manual (Dana Darurat, Pendidikan Anak, Liburan, Hari Tua) agar tidak tercampur dengan kas harian."
        actions={
          <Button variant="primary">
            <Plus className="h-4 w-4" />
            <span>Pos Tabungan Baru</span>
          </Button>
        }
      />

      <EmptyState
        icon={PiggyBank}
        title="Belum Ada Pos Tabungan"
        description="Tentukan target nominal dan tenggat waktu untuk setiap impian keluarga, lalu setor atau tarik dana kapan saja."
        actionLabel="+ Buat Pos Tabungan"
      />
    </div>
  );
}

