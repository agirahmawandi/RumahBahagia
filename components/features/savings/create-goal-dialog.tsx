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
import { NominalInput } from "@/components/ui/nominal-input";
import { createSavingsGoalAction } from "@/app/actions/transactions";

interface CreateGoalDialogProps {
  householdId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateGoalDialog({
  householdId,
  open,
  onOpenChange,
  onSuccess,
}: CreateGoalDialogProps) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState(10_000_000);
  const [targetDate, setTargetDate] = useState("");
  const [description, setDescription] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Nama pos tabungan wajib diisi.");
      return;
    }

    setLoading(true);
    const result = await createSavingsGoalAction({
      householdId,
      name: name.trim(),
      targetAmount,
      targetDate: targetDate || undefined,
      description: description || undefined,
    });

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Pos tabungan berhasil dibuat!");
      onOpenChange(false);
      setName("");
      onSuccess?.();
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogClose onClose={() => onOpenChange(false)} />
      <DialogHeader>
        <DialogTitle>Buat Pos Tabungan Baru</DialogTitle>
        <DialogDescription>
          Pos tabungan manual untuk mengalokasikan impian masa depan keluarga.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="goal-name">Nama Pos Tabungan</Label>
          <Input
            id="goal-name"
            placeholder="Contoh: Dana Darurat, Pendidikan Anak, Liburan Akhir Tahun"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label>Target Nominal</Label>
          <NominalInput
            value={targetAmount}
            onValueChange={setTargetAmount}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="goal-date">Target Tanggal Selesai (Opsional)</Label>
          <Input
            id="goal-date"
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="goal-desc">Catatan / Deskripsi (Opsional)</Label>
          <Input
            id="goal-desc"
            placeholder="Alasan atau rencana penggunaan tabungan ini"
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
            {loading ? "Menyimpan..." : "Simpan Pos Tabungan"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

