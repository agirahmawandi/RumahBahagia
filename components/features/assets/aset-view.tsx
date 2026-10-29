"use client";

import React, { useState } from "react";
import { Home, Plus } from "lucide-react";
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
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableMoneyCell,
} from "@/components/ui/table";
import { formatRupiah, formatTanggal } from "@/lib/format";
import { createAssetAction } from "@/app/actions/assets";
import type { AssetItem } from "@/lib/data/assets";
import type { AccountWithBalance } from "@/lib/data/accounts";

interface AsetViewProps {
  householdId: string;
  assets: AssetItem[];
  accounts: AccountWithBalance[];
}

export function AsetView({ householdId, assets, accounts }: AsetViewProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cost, setCost] = useState(0);

  const totalCurrentValue = assets.reduce((s, a) => s + a.current_value, 0);
  const totalCost = assets.reduce((s, a) => s + a.acquisition_cost, 0);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (cost <= 0) {
      toast.error("Nilai perolehan aset harus lebih besar dari 0.");
      return;
    }
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set("householdId", householdId);
    formData.set("cost", String(cost));

    const res = await createAssetAction(formData);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Aset tetap berhasil dicatat ke neraca!");
      setCreateDialogOpen(false);
      setCost(0);
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        badge="Aset Berharga & Tetap"
        title="Daftar Aset Fisik"
        subtitle="Catat kepemilikan Properti, Rumah, Tanah, Kendaraan, dan Perhiasan keluarga yang membentuk kekayaan bersih jangka panjang."
        actions={
          <Button variant="primary" onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            <span>Tambah Aset</span>
          </Button>
        }
      />

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <span className="font-ui text-xs font-bold text-ink-muted">
            Total Nilai Aset Fisik
          </span>
          <p className="mt-2 tabular-money text-2xl sm:text-3xl font-bold text-teal-700">
            {formatRupiah(totalCurrentValue)}
          </p>
        </Card>
        <Card className="p-4">
          <span className="font-ui text-xs font-bold text-ink-muted">
            Total Nilai Perolehan
          </span>
          <p className="mt-2 tabular-money text-2xl sm:text-3xl font-bold text-ink">
            {formatRupiah(totalCost)}
          </p>
        </Card>
        <Card className="p-4">
          <span className="font-ui text-xs font-bold text-ink-muted">
            Jumlah Unit Aset
          </span>
          <p className="mt-2 tabular-money text-2xl sm:text-3xl font-bold text-ink">
            {assets.length}
          </p>
        </Card>
      </div>

      {/* Table / Empty State */}
      {assets.length === 0 ? (
        <EmptyState
          icon={Home}
          title="Belum Ada Aset Tercatat"
          description="Tambahkan aset fisik seperti Rumah, Kendaraan, Tanah, atau Gadget utama keluarga Anda."
          actionLabel="+ Tambah Aset Pertama"
          onAction={() => setCreateDialogOpen(true)}
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Aset</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Tanggal Perolehan</TableHead>
                <TableHead>Biaya Perolehan</TableHead>
                <TableHead className="text-right">Nilai Saat Ini</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assets.map((asset) => (
                <TableRow key={asset.id}>
                  <TableCell>
                    <span className="font-bold text-ink">{asset.name}</span>
                    {asset.notes && (
                      <p className="text-xs text-ink-muted line-clamp-1">
                        {asset.notes}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="neutral" className="capitalize">
                      {asset.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">
                    {formatTanggal(asset.acquired_date)}
                  </TableCell>
                  <TableCell className="tabular-money font-medium text-xs">
                    {formatRupiah(asset.acquisition_cost)}
                  </TableCell>
                  <TableMoneyCell className="text-teal-700 font-bold">
                    {formatRupiah(asset.current_value)}
                  </TableMoneyCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Dialog Tambah Aset */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogClose onClose={() => setCreateDialogOpen(false)} />
        <DialogHeader>
          <DialogTitle>Tambah Aset Tetap</DialogTitle>
          <DialogDescription>
            Akan otomatis dicatat ke akun COA Aset Tetap (1-4xxx).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreate} className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="asset-name">Nama Aset</Label>
            <Input
              id="asset-name"
              name="name"
              placeholder="Contoh: Rumah Tinggal, Honda HR-V, MacBook Pro"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="asset-cat">Kategori Aset</Label>
              <Select id="asset-cat" name="category" defaultValue="property">
                <option value="property">Properti / Rumah</option>
                <option value="vehicle">Kendaraan</option>
                <option value="electronics">Elektronik &amp; Gadget</option>
                <option value="land">Tanah</option>
                <option value="jewelry">Logam Mulia / Perhiasan</option>
                <option value="other">Lainnya</option>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="asset-date">Tanggal Perolehan</Label>
              <Input
                id="asset-date"
                name="acquiredDate"
                type="date"
                defaultValue={new Date().toISOString().substring(0, 10)}
                required
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Nilai Perolehan / Taksiran (Rp)</Label>
            <NominalInput value={cost} onValueChange={setCost} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="asset-acc">Sumber Dana (Opsional)</Label>
            <Select id="asset-acc" name="accountId" defaultValue="">
              <option value="">
                Saldo Awal / Dimiliki Sebelum Aplikasi (Ekuitas Saldo Awal)
              </option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  Beli via {acc.name} ({formatRupiah(acc.balance)})
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="asset-notes">Catatan Tambahan (Opsional)</Label>
            <Input
              id="asset-notes"
              name="notes"
              placeholder="Nomor SHM, pelat nomor, no seri garansi"
            />
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
              {loading ? "Menyimpan..." : "Simpan Aset"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}

