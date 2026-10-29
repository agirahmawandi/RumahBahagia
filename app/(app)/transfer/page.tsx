import { ArrowLeftRight, Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

export default function TransferPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        badge="Mutasi Internal"
        title="Transfer Antar Rekening"
        subtitle="Pindahkan saldo antar rekening Bank, Dompet Tunai (Cash), atau E-Wallet beserta pencatatan biaya admin."
        actions={
          <Button variant="primary">
            <Plus className="h-4 w-4" />
            <span>Transfer Baru</span>
          </Button>
        }
      />

      <EmptyState
        icon={ArrowLeftRight}
        title="Belum Ada Riwayat Transfer"
        description="Tarik tunai di ATM atau top-up E-Wallet dicatat sebagai Transfer agar tidak dihitung ganda sebagai pengeluaran."
        actionLabel="+ Buat Transfer Antar Rekening"
      />
    </div>
  );
}

