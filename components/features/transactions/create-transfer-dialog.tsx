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
import { recordTransferAction } from "@/app/actions/transactions";

interface CreateTransferDialogProps {
  householdId: string;
  accounts: { id: string; name: string }[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateTransferDialog({
  householdId,
  accounts,
  open,
  onOpenChange,
  onSuccess,
}: CreateTransferDialogProps) {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState(0);
  const [adminFee, setAdminFee] = useState(0);
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [fromAccountId, setFromAccountId] = useState(() => accounts[0]?.id || "");
  const [toAccountId, setToAccountId] = useState(() => accounts[1]?.id || "");
  const [description, setDescription] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (amount <= 0) {
      toast.error("Nominal transfer harus lebih besar dari 0");
      return;
    }
    if (fromAccountId === toAccountId) {
      toast.error("Rekening asal dan tujuan tidak boleh sama.");
      return;
    }

    setLoading(true);
    const result = await recordTransferAction({
      householdId,
      date,
      amount,
      fromAccountId,
      toAccountId,
      adminFee,
      description: description || "Transfer antar rekening",
    });

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Transfer berhasil dicatat!");
      onOpenChange(false);
      setAmount(0);
      setAdminFee(0);
      setDescription("");
      onSuccess?.();
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogClose onClose={() => onOpenChange(false)} />
      <DialogHeader>
        <DialogTitle>Transfer Antar Rekening</DialogTitle>
        <DialogDescription>
          Pindah dana antar rekening kas, bank, atau e-wallet tanpa memicu pengeluaran ganda.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="space-y-1.5">
          <Label>Nominal Transfer</Label>
          <NominalInput value={amount} onValueChange={setAmount} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="trf-from">Rekening Asal (Sumber)</Label>
            <Select
              id="trf-from"
              value={fromAccountId}
              onChange={(e) => setFromAccountId(e.target.value)}
              required
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="trf-to">Rekening Tujuan</Label>
            <Select
              id="trf-to"
              value={toAccountId}
              onChange={(e) => setToAccountId(e.target.value)}
              required
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="trf-date">Tanggal</Label>
            <Input
              id="trf-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>Biaya Admin (Opsional)</Label>
            <NominalInput value={adminFee} onValueChange={setAdminFee} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="trf-desc">Keterangan / Catatan</Label>
          <Input
            id="trf-desc"
            placeholder="Contoh: Tarik tunai ATM, Top up GoPay"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-line/60">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            Batal
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan Transfer"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

