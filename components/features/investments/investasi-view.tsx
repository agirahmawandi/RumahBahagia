"use client";

import React, { useState } from "react";
import { TrendingUp, Plus } from "lucide-react";
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
import { formatRupiah } from "@/lib/format";
import {
  createInvestmentAction,
  recordInvestmentBuyAction,
} from "@/app/actions/investments";
import type { InvestmentItem } from "@/lib/data/investments";
import type { AccountWithBalance } from "@/lib/data/accounts";

interface InvestasiViewProps {
  householdId: string;
  investments: InvestmentItem[];
  accounts: AccountWithBalance[];
}

export function InvestasiView({
  householdId,
  investments,
  accounts,
}: InvestasiViewProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [buyDialogOpen, setBuyDialogOpen] = useState(false);
  const [selectedInv, setSelectedInv] = useState<InvestmentItem | null>(null);
  const [loading, setLoading] = useState(false);

  // Buy form state
  const [units, setUnits] = useState(1);
  const [price, setPrice] = useState(0);
  const [fee, setFee] = useState(0);
  const [accountId, setAccountId] = useState(() => accounts[0]?.id || "");
  const [buyDate, setBuyDate] = useState(() => new Date().toISOString().substring(0, 10));

  const totalPortfolioValue = investments.reduce((s, i) => s + i.market_value, 0);
  const totalCost = investments.reduce((s, i) => s + i.totalCost, 0);
  const totalGain = totalPortfolioValue - totalCost;

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set("householdId", householdId);

    const res = await createInvestmentAction(formData);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Instrumen investasi berhasil ditambahkan!");
      setCreateDialogOpen(false);
    }
    setLoading(false);
  }

  async function handleBuy(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedInv || !accountId || units <= 0 || price <= 0) {
      toast.error("Mohon lengkapi data pembelian.");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.set("investmentId", selectedInv.id);
    formData.set("accountId", accountId);
    formData.set("units", String(units));
    formData.set("price", String(price));
    formData.set("fee", String(fee));
    formData.set("date", buyDate);

    const res = await recordInvestmentBuyAction(formData);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Pembelian investasi berhasil dicatat ke buku besar!");
      setBuyDialogOpen(false);
      setPrice(0);
      setFee(0);
    }
    setLoading(false);
  }

  function openBuy(inv: InvestmentItem) {
    setSelectedInv(inv);
    setPrice(inv.market_price || 0);
    setBuyDialogOpen(true);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        badge="Pertumbuhan Aset"
        title="Portofolio Investasi"
        subtitle="Pantau kepemilikan Reksadana, Saham, Emas, dan Obligasi dengan perhitungan rata-rata modal modal (moving average) & untung/rugi."
        actions={
          <Button variant="primary" onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            <span>Tambah Investasi</span>
          </Button>
        }
      />

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <span className="font-ui text-xs font-bold text-ink-muted">
            Total Nilai Pasar
          </span>
          <p className="mt-2 tabular-money text-2xl sm:text-3xl font-bold text-teal-700">
            {formatRupiah(totalPortfolioValue)}
          </p>
        </Card>
        <Card className="p-4">
          <span className="font-ui text-xs font-bold text-ink-muted">
            Total Modal Disetor
          </span>
          <p className="mt-2 tabular-money text-2xl sm:text-3xl font-bold text-ink">
            {formatRupiah(totalCost)}
          </p>
        </Card>
        <Card className="p-4">
          <span className="font-ui text-xs font-bold text-ink-muted">
            Keuntungan / Kerugian (Unrealized)
          </span>
          <p
            className={`mt-2 tabular-money text-2xl sm:text-3xl font-bold ${
              totalGain >= 0 ? "text-teal-700" : "text-flame-700"
            }`}
          >
            {totalGain >= 0 ? "+" : ""}
            {formatRupiah(totalGain)}
          </p>
        </Card>
      </div>

      {/* Table / Empty State */}
      {investments.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title="Belum Ada Portofolio Investasi"
          description="Tambahkan aset investasi seperti Reksadana Pasar Uang, Emas Digital, atau Saham keluarga Anda."
          actionLabel="+ Tambah Instrumen Investasi"
          onAction={() => setCreateDialogOpen(true)}
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Instrumen</TableHead>
                <TableHead>Jenis / Platform</TableHead>
                <TableHead>Unit Dimiliki</TableHead>
                <TableHead>Harga Rata-rata</TableHead>
                <TableHead className="text-right">Nilai Pasar</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {investments.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell>
                    <span className="font-bold text-ink">{inv.name}</span>
                    {inv.ticker && (
                      <span className="ml-2 font-mono text-xs text-ink-muted">
                        ({inv.ticker})
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="neutral" className="capitalize">
                        {inv.type.replace("_", " ")}
                      </Badge>
                      {inv.platform && (
                        <span className="text-xs text-ink-muted">
                          · {inv.platform}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="tabular-money font-semibold text-xs">
                    {inv.units.toLocaleString("id-ID")} unit
                  </TableCell>
                  <TableCell className="tabular-money font-medium text-xs">
                    {formatRupiah(inv.avg_cost)}
                  </TableCell>
                  <TableMoneyCell className="text-teal-700 font-bold">
                    {formatRupiah(inv.market_value)}
                  </TableMoneyCell>
                  <TableCell className="text-right">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => openBuy(inv)}
                      disabled={accounts.length === 0}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Beli</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Dialog Buat Instrumen Baru */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogClose onClose={() => setCreateDialogOpen(false)} />
        <DialogHeader>
          <DialogTitle>Tambah Instrumen Investasi</DialogTitle>
          <DialogDescription>
            Membuat sub-akun COA Investasi (1-3xxx) di buku besar.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreate} className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="inv-name">Nama Investasi</Label>
            <Input
              id="inv-name"
              name="name"
              placeholder="Contoh: Sucorinvest Money Market, BBCA, Emas Antam"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="inv-type">Jenis</Label>
              <Select id="inv-type" name="type" defaultValue="mutual_fund">
                <option value="mutual_fund">Reksadana</option>
                <option value="stock">Saham</option>
                <option value="gold">Emas</option>
                <option value="bond">Obligasi / SBN</option>
                <option value="crypto">Kripto</option>
                <option value="deposit">Deposito</option>
                <option value="other">Lainnya</option>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="inv-platform">Platform / Sekuritas</Label>
              <Input
                id="inv-platform"
                name="platform"
                placeholder="Bibit, Ajaib, Pluang"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="inv-ticker">Kode / Ticker (Opsional)</Label>
            <Input id="inv-ticker" name="ticker" placeholder="BBCA, TLKM, XAU" />
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
              {loading ? "Menyimpan..." : "Simpan Investasi"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Dialog Beli Unit */}
      {selectedInv && (
        <Dialog open={buyDialogOpen} onOpenChange={setBuyDialogOpen}>
          <DialogClose onClose={() => setBuyDialogOpen(false)} />
          <DialogHeader>
            <DialogTitle>Catat Pembelian {selectedInv.name}</DialogTitle>
            <DialogDescription>
              Dana akan didebit dari rekening sumber dan dicatat ke nilai modal investasi.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleBuy} className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="buy-units">Jumlah Unit</Label>
                <Input
                  id="buy-units"
                  type="number"
                  step="any"
                  min="0.0001"
                  value={units}
                  onChange={(e) => setUnits(Number(e.target.value))}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Harga per Unit (Rp)</Label>
                <NominalInput value={price} onValueChange={setPrice} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="buy-acc">Rekening Sumber Dana</Label>
                <Select
                  id="buy-acc"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({formatRupiah(acc.balance)})
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="buy-date">Tanggal Transaksi</Label>
                <Input
                  id="buy-date"
                  type="date"
                  value={buyDate}
                  onChange={(e) => setBuyDate(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="rounded-[10px] bg-cream-50 p-3 border border-line flex justify-between items-center text-sm">
              <span className="font-ui text-xs font-bold text-ink-muted">
                Total Biaya Pembelian:
              </span>
              <span className="font-bold tabular-money text-base text-teal-700">
                {formatRupiah(units * price + fee)}
              </span>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setBuyDialogOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? "Memproses..." : "Konfirmasi Beli"}
              </Button>
            </div>
          </form>
        </Dialog>
      )}
    </div>
  );
}
