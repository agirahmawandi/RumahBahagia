"use client";

import React, { useState } from "react";
import { HandCoins, Plus, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { NominalInput } from "@/components/ui/nominal-input";
import { EmptyState } from "@/components/ui/empty-state";
import { SavingsProgress } from "@/components/ui/progress";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { formatRupiah } from "@/lib/format";
import {
  createLiabilityAction,
  recordLiabilityPaymentAction,
} from "@/app/actions/liabilities";
import type { LiabilityItem } from "@/lib/data/liabilities";
import type { AccountWithBalance } from "@/lib/data/accounts";

interface UtangViewProps {
  householdId: string;
  liabilities: LiabilityItem[];
  accounts: AccountWithBalance[];
}

export function UtangView({
  householdId,
  liabilities,
  accounts,
}: UtangViewProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [payDialogOpen, setPayDialogOpen] = useState(false);
  const [selectedLiability, setSelectedLiability] = useState<LiabilityItem | null>(null);
  const [loading, setLoading] = useState(false);

  // Form Create State
  const [principal, setPrincipal] = useState(0);
  const [installmentAmount, setInstallmentAmount] = useState(0);

  // Form Pay State
  const [payPrincipal, setPayPrincipal] = useState(0);
  const [payInterest, setPayInterest] = useState(0);
  const [payAccountId, setPayAccountId] = useState(() => accounts[0]?.id || "");
  const [payDate, setPayDate] = useState(() => new Date().toISOString().substring(0, 10));

  const totalOutstanding = liabilities.reduce((s, l) => s + l.remainingBalance, 0);
  const totalPaid = liabilities.reduce((s, l) => s + l.paidAmount, 0);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (principal <= 0) {
      toast.error("Nominal pokok pinjaman harus lebih besar dari 0.");
      return;
    }
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set("householdId", householdId);
    formData.set("principal", String(principal));
    formData.set("installmentAmount", String(installmentAmount));

    const res = await createLiabilityAction(formData);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Kewajiban pinjaman berhasil dicatat ke neraca!");
      setCreateDialogOpen(false);
      setPrincipal(0);
      setInstallmentAmount(0);
    }
    setLoading(false);
  }

  async function handlePay(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedLiability || !payAccountId || payPrincipal + payInterest <= 0) {
      toast.error("Nominal pembayaran cicilan harus lebih besar dari 0.");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.set("liabilityId", selectedLiability.id);
    formData.set("accountId", payAccountId);
    formData.set("principalAmount", String(payPrincipal));
    formData.set("interestAmount", String(payInterest));
    formData.set("date", payDate);
    formData.set("note", `Cicilan ${selectedLiability.name}`);

    const res = await recordLiabilityPaymentAction(formData);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Pembayaran cicilan berhasil dibukukan!");
      setPayDialogOpen(false);
      setPayPrincipal(0);
      setPayInterest(0);
    }
    setLoading(false);
  }

  function openPay(l: LiabilityItem) {
    setSelectedLiability(l);
    setPayPrincipal(l.installment_amount || 0);
    setPayInterest(0);
    setPayDialogOpen(true);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        badge="Kewajiban & Liabilitas"
        title="Daftar Utang & Cicilan"
        subtitle="Pantau sisa pokok pinjaman, tenor cicilan, pemisahan pokok vs bunga, dan progres menuju lunas."
        actions={
          <Button variant="primary" onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            <span>Catat Pinjaman Baru</span>
          </Button>
        }
      />

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <span className="font-ui text-xs font-bold text-ink-muted">
            Total Sisa Utang (Outstanding)
          </span>
          <p className="mt-2 tabular-money text-2xl sm:text-3xl font-bold text-flame-700">
            {formatRupiah(totalOutstanding)}
          </p>
        </Card>
        <Card className="p-4">
          <span className="font-ui text-xs font-bold text-ink-muted">
            Total Pokok Terbayar
          </span>
          <p className="mt-2 tabular-money text-2xl sm:text-3xl font-bold text-teal-700">
            {formatRupiah(totalPaid)}
          </p>
        </Card>
        <Card className="p-4">
          <span className="font-ui text-xs font-bold text-ink-muted">
            Fasilitas Pinjaman Aktif
          </span>
          <p className="mt-2 tabular-money text-2xl sm:text-3xl font-bold text-ink">
            {liabilities.length}
          </p>
        </Card>
      </div>

      {/* List / Empty State */}
      {liabilities.length === 0 ? (
        <EmptyState
          icon={HandCoins}
          title="Tidak Ada Catatan Utang"
          description="Alhamdulillah, keluarga Anda belum memiliki catatan utang atau cicilan aktif."
          actionLabel="+ Catat Pinjaman / KPR"
          onAction={() => setCreateDialogOpen(true)}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {liabilities.map((l) => (
            <Card key={l.id} className="p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <Badge variant="expense" className="capitalize">
                    {l.type.replace("_", " ")}
                  </Badge>
                  {l.lender && (
                    <span className="font-ui text-xs font-bold text-ink-muted">
                      {l.lender}
                    </span>
                  )}
                </div>
                <h3 className="mt-3 font-display text-lg font-bold text-ink">
                  {l.name}
                </h3>
                {l.installment_amount > 0 && (
                  <p className="mt-1 font-body text-xs text-ink-muted">
                    Cicilan: {formatRupiah(l.installment_amount)}/bln · Tgl {l.due_day}
                  </p>
                )}
              </div>

              <div className="space-y-3 pt-3 border-t border-line">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-ui text-xs font-bold text-ink-muted">
                      Sisa Pokok
                    </span>
                    <span className="tabular-money font-bold text-sm text-flame-700">
                      {formatRupiah(l.remainingBalance)} / {formatRupiah(l.principal, { compact: true })}
                    </span>
                  </div>
                  <SavingsProgress
                    current={l.paidAmount}
                    target={l.principal}
                  />
                  <div className="flex justify-between text-[11px] font-body text-ink-muted pt-1">
                    <span>{l.progressPercent}% Terbayar</span>
                    {l.tenor_months > 0 && <span>Tenor {l.tenor_months} bln</span>}
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  className="w-full text-xs mt-2"
                  onClick={() => openPay(l)}
                  disabled={accounts.length === 0}
                >
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  <span>Bayar Cicilan</span>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog Buat Utang Baru */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogClose onClose={() => setCreateDialogOpen(false)} />
        <DialogHeader>
          <DialogTitle>Catat Pinjaman / Utang Baru</DialogTitle>
          <DialogDescription>
            Membuat sub-akun liabilitas di COA (2-2xxx) dan jurnal saldo awal utang.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreate} className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="liab-name">Nama Pinjaman / Cicilan</Label>
            <Input
              id="liab-name"
              name="name"
              placeholder="KPR Rumah Tahap 1, Cicilan Mobil, Paylater"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="liab-type">Jenis Pinjaman</Label>
              <Select id="liab-type" name="type" defaultValue="mortgage">
                <option value="mortgage">KPR (Kredit Rumah)</option>
                <option value="vehicle_loan">Kredit Kendaraan</option>
                <option value="personal_loan">Kredit Tanpa Agunan (KTA)</option>
                <option value="paylater">Paylater / Pinjol</option>
                <option value="credit_card">Kartu Kredit</option>
                <option value="other">Pinjaman Pribadi / Lainnya</option>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="liab-lender">Lembaga / Kreditur</Label>
              <Input id="liab-lender" name="lender" placeholder="Bank Mandiri, BCA Finance" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Pokok Pinjaman Awal (Rp)</Label>
              <NominalInput value={principal} onValueChange={setPrincipal} />
            </div>
            <div className="space-y-1.5">
              <Label>Angsuran Bulanan (Rp)</Label>
              <NominalInput
                value={installmentAmount}
                onValueChange={setInstallmentAmount}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="liab-tenor">Tenor (Bulan)</Label>
              <Input id="liab-tenor" name="tenorMonths" type="number" defaultValue="12" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="liab-acc">Pencairan ke Rekening (Opsional)</Label>
              <Select id="liab-acc" name="accountId" defaultValue="">
                <option value="">Pinjaman Berjalan (Ekuitas Saldo Awal)</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    Masuk ke {acc.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan Pinjaman"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Dialog Bayar Cicilan */}
      {selectedLiability && (
        <Dialog open={payDialogOpen} onOpenChange={setPayDialogOpen}>
          <DialogClose onClose={() => setPayDialogOpen(false)} />
          <DialogHeader>
            <DialogTitle>Bayar Cicilan: {selectedLiability.name}</DialogTitle>
            <DialogDescription>
              Pisahkan pembayaran pokok (mengurangi utang) dan bunga (dicatat sebagai beban bunga 5-9100).
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePay} className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Porsi Pokok Pinjaman (Rp)</Label>
                <NominalInput value={payPrincipal} onValueChange={setPayPrincipal} />
              </div>
              <div className="space-y-1.5">
                <Label>Porsi Bunga Pinjaman (Rp)</Label>
                <NominalInput value={payInterest} onValueChange={setPayInterest} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="pay-acc">Rekening Pembayaran</Label>
                <Select
                  id="pay-acc"
                  value={payAccountId}
                  onChange={(e) => setPayAccountId(e.target.value)}
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({formatRupiah(acc.balance)})
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pay-date">Tanggal Bayar</Label>
                <Input
                  id="pay-date"
                  type="date"
                  value={payDate}
                  onChange={(e) => setPayDate(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="rounded-[10px] bg-cream-50 p-3 border border-line flex justify-between items-center text-sm">
              <span className="font-ui text-xs font-bold text-ink-muted">
                Total Dipotong dari Rekening:
              </span>
              <span className="font-bold tabular-money text-base text-flame-700">
                {formatRupiah(payPrincipal + payInterest)}
              </span>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPayDialogOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? "Memproses..." : "Konfirmasi Pembayaran"}
              </Button>
            </div>
          </form>
        </Dialog>
      )}
    </div>
  );
}
