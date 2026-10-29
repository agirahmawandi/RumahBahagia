"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { NominalInput } from "@/components/ui/nominal-input";
import { createCashAccountAction } from "@/app/actions/transactions";

interface CreateAccountDialogProps {
  householdId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateAccountDialog({
  householdId,
  open,
  onOpenChange,
  onSuccess,
}: CreateAccountDialogProps) {
  const [loading, setLoading] = useState(false);
  const [accountType, setAccountType] = useState<
    "cash" | "bank" | "ewallet" | "credit_card"
  >("bank");
  const [openingBalance, setOpeningBalance] = useState(0);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("householdId", householdId);
    formData.set("openingBalance", String(openingBalance));

    const result = await createCashAccountAction(formData);

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Rekening berhasil dibuat!");
      onOpenChange(false);
      onSuccess?.();
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogClose onClose={() => onOpenChange(false)} />
      <DialogHeader>
        <DialogTitle>Tambah Rekening Baru</DialogTitle>
        <DialogDescription>
          Rekening akan otomatis terhubung ke akun COA dan jurnal saldo awal.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="type">Jenis Rekening</Label>
          <Select
            id="type"
            name="type"
            value={accountType}
            onChange={(e) =>
              setAccountType(
                e.target.value as "cash" | "bank" | "ewallet" | "credit_card"
              )
            }
          >
            <option value="bank">Bank (Tabungan / Giro)</option>
            <option value="cash">Tunai (Cash / Dompet Fisik)</option>
            <option value="ewallet">E-Wallet (GoPay, OVO, Dana, ShopeePay)</option>
            <option value="credit_card">Kartu Kredit (Liabilitas)</option>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="name">Nama Rekening</Label>
          <Input
            id="name"
            name="name"
            placeholder="Contoh: BCA Tahapan, Dompet Tunai Ayah"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="institution">Institusi (Opsional)</Label>
            <Input
              id="institution"
              name="institution"
              placeholder="BCA, Mandiri, GoPay"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="last4">4 Digit Terakhir (Opsional)</Label>
            <Input
              id="last4"
              name="accountNumberLast4"
              placeholder="1234"
              maxLength={4}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>
            {accountType === "credit_card" ? "Tagihan Awal" : "Saldo Awal"}
          </Label>
          <NominalInput
            value={openingBalance}
            onValueChange={setOpeningBalance}
          />
          <p className="font-body text-[11px] text-ink-muted">
            Saldo awal akan otomatis dibuatkan ayat jurnal berpasangan ke akun
            Ekuitas Saldo Awal.
          </p>
        </div>

        {accountType === "credit_card" && (
          <div className="space-y-1.5">
            <Label htmlFor="creditLimit">Limit Kartu Kredit</Label>
            <Input
              id="creditLimit"
              name="creditLimit"
              type="number"
              placeholder="Contoh: 10000000"
            />
          </div>
        )}

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-line/60">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            Batal
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan Rekening"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

