import { Banknote, CreditCard, Landmark, Plus, Smartphone, Wallet } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { formatRupiah } from "@/lib/format";

const ACCOUNT_GROUPS = [
  { label: "Tunai (Cash)", icon: Banknote, total: 0 },
  { label: "Bank", icon: Landmark, total: 0 },
  { label: "E-Wallet", icon: Smartphone, total: 0 },
  { label: "Kartu Kredit", icon: CreditCard, total: 0 },
];

export default function RekeningPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        badge="Akun Kas & Liabilitas"
        title="Daftar Rekening"
        subtitle="Kelola semua rekening Bank, Dompet Tunai, E-Wallet, dan Kartu Kredit beserta fitur rekonsiliasi saldo."
        actions={
          <Button variant="primary">
            <Plus className="h-4 w-4" />
            <span>Tambah Rekening</span>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ACCOUNT_GROUPS.map((group) => {
          const Icon = group.icon;
          return (
            <Card key={group.label} className="p-4">
              <div className="flex items-center justify-between text-ink-muted">
                <span className="font-ui text-xs font-bold">{group.label}</span>
                <Icon className="h-4 w-4 text-teal-700" strokeWidth={1.75} />
              </div>
              <p className="mt-2 tabular-money text-2xl font-bold text-ink">
                {formatRupiah(group.total)}
              </p>
            </Card>
          );
        })}
      </div>

      <EmptyState
        icon={Wallet}
        title="Tambah Rekening Pertama Anda"
        description="Mulai dengan membuat rekening Dompet Tunai (Cash) atau rekening Bank utama beserta saldo awalnya."
        actionLabel="+ Buat Rekening Baru"
      />
    </div>
  );
}

