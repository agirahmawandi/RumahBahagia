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
import { recordExpenseAction } from "@/app/actions/transactions";

interface CreateExpenseDialogProps {
  householdId: string;
  accounts: { id: string; name: string }[];
  categories: { id: string; name: string }[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateExpenseDialog({
  householdId,
  accounts,
  categories,
  open,
  onOpenChange,
  onSuccess,
}: CreateExpenseDialogProps) {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [accountId, setAccountId] = useState(() => accounts[0]?.id || "");
  const [categoryId, setCategoryId] = useState(() => categories[0]?.id || "");
  const [description, setDescription] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (amount <= 0) {
      toast.error("Nominal pengeluaran harus lebih besar dari 0");
      return;
    }
    if (!accountId || !categoryId) {
      toast.error("Pilih rekening sumber dan kategori pengeluaran.");
      return;
    }

    setLoading(true);
    const result = await recordExpenseAction({
      householdId,
      date,
      amount,
      accountId,
      categoryId,
      description: description || "Pengeluaran",
    });

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Pengeluaran berhasil dicatat!");
      onOpenChange(false);
      setAmount(0);
      setDescription("");
      onSuccess?.();
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogClose onClose={() => onOpenChange(false)} />
      <DialogHeader>
        <DialogTitle>Catat Pengeluaran</DialogTitle>
        <DialogDescription>
          Pengeluaran akan memotong saldo rekening sumber dan mencatat beban di laporan keuangan.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="space-y-1.5">
          <Label>Nominal Pengeluaran</Label>
          <NominalInput value={amount} onValueChange={setAmount} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="exp-date">Tanggal</Label>
            <Input
              id="exp-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="exp-account">Rekening Sumber</Label>
            <Select
              id="exp-account"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              required
            >
              {accounts.length === 0 && (
                <option value="">(Belum ada rekening)</option>
              )}
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="exp-cat">Kategori Pengeluaran</Label>
          <Select
            id="exp-cat"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
          >
            {categories.length === 0 && (
              <option value="">(Kategori bawaan)</option>
            )}
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="exp-desc">Keterangan / Catatan</Label>
          <Input
            id="exp-desc"
            placeholder="Contoh: Belanja mingguan, Makan siang keluarga"
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
          <Button type="submit" variant="danger" disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan Pengeluaran"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

