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
import {
  savingDepositAction,
  savingWithdrawAction,
} from "@/app/actions/transactions";

interface DepositWithdrawDialogProps {
  mode: "deposit" | "withdraw";
  goal: { id: string; name: string };
  accounts: { id: string; name: string }[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DepositWithdrawDialog({
  mode,
  goal,
  accounts,
  open,
  onOpenChange,
  onSuccess,
}: DepositWithdrawDialogProps) {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState(0);
  const [accountId, setAccountId] = useState(() => accounts[0]?.id || "");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState("");

  const isDeposit = mode === "deposit";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (amount <= 0) {
      toast.error("Nominal harus lebih besar dari 0");
      return;
    }
    if (!accountId) {
      toast.error("Pilih rekening sumber/tujuan.");
      return;
    }

    setLoading(true);
    let result;
    if (isDeposit) {
      result = await savingDepositAction({
        goalId: goal.id,
        accountId,
        amount,
        date,
        note: note || `Setor ke ${goal.name}`,
      });
    } else {
      result = await savingWithdrawAction({
        goalId: goal.id,
        accountId,
        amount,
        date,
        note: note || `Tarik dari ${goal.name}`,
      });
    }

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success(
        isDeposit
          ? `Berhasil menyetor dana ke ${goal.name}!`
          : `Berhasil menarik dana dari ${goal.name}!`
      );
      onOpenChange(false);
      setAmount(0);
      onSuccess?.();
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogClose onClose={() => onOpenChange(false)} />
      <DialogHeader>
        <DialogTitle>
          {isDeposit ? `Setor ke ${goal.name}` : `Tarik dari ${goal.name}`}
        </DialogTitle>
        <DialogDescription>
          {isDeposit
            ? "Pindahkan saldo dari rekening kas ke akun pos tabungan ini."
            : "Tarik dana dari pos tabungan kembali ke rekening kas operasional."}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="space-y-1.5">
          <Label>Nominal {isDeposit ? "Setoran" : "Penarikan"}</Label>
          <NominalInput value={amount} onValueChange={setAmount} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="sw-account">
              {isDeposit ? "Dari Rekening Kas" : "Masuk ke Rekening"}
            </Label>
            <Select
              id="sw-account"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
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
            <Label htmlFor="sw-date">Tanggal</Label>
            <Input
              id="sw-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="sw-note">Catatan (Opsional)</Label>
          <Input
            id="sw-note"
            placeholder={
              isDeposit
                ? "Contoh: Sisihkan gaji bulan ini"
                : "Contoh: Bayar biaya pendaftaran sekolah"
            }
            value={note}
            onChange={(e) => setNote(e.target.value)}
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
          <Button
            type="submit"
            variant={isDeposit ? "primary" : "secondary"}
            disabled={loading}
          >
            {loading ? "Memproses..." : isDeposit ? "Setor Sekarang" : "Tarik Sekarang"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

