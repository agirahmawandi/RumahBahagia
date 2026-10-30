"use client";

import React, { useState } from "react";
import {
  FileBarChart2,
  Printer,
  Scale,
  TrendingUp,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import type {
  BalanceSheetRow,
  IncomeStatementRow,
  NetWorthSummary,
} from "@/lib/data/reports";

interface LaporanViewProps {
  householdName: string;
  netWorth: NetWorthSummary;
  balanceSheet: BalanceSheetRow[];
  incomeStatement: IncomeStatementRow[];
}

export function LaporanView({
  householdName,
  netWorth,
  balanceSheet,
  incomeStatement,
}: LaporanViewProps) {
  const [activeTab, setActiveTab] = useState<"neraca" | "surplus" | "networth">("neraca");

  // Neraca groupings
  const assetRows = balanceSheet.filter((r) => r.class === "asset");
  const liabilityRows = balanceSheet.filter((r) => r.class === "liability");
  const equityRows = balanceSheet.filter((r) => r.class === "equity");

  const totalAssets = assetRows.reduce((s, r) => s + r.balance, 0);
  const totalLiabilities = liabilityRows.reduce((s, r) => s + r.balance, 0);
  const totalEquity = equityRows.reduce((s, r) => s + r.balance, 0);

  // Surplus / Defisit groupings
  const incomeRows = incomeStatement.filter((r) => r.class === "income");
  const expenseRows = incomeStatement.filter((r) => r.class === "expense");

  const totalIncome = incomeRows.reduce((s, r) => s + r.total, 0);
  const totalExpense = expenseRows.reduce((s, r) => s + r.total, 0);
  const netSurplus = totalIncome - totalExpense;

  function handlePrint() {
    window.print();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        badge="Audit & Akuntabilitas"
        title="Laporan Keuangan Keluarga"
        subtitle={`Laporan keuangan berstandar akuntansi double-entry untuk ${householdName}.`}
        actions={
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4" />
            <span>Cetak / Ekspor PDF</span>
          </Button>
        }
      />

      {/* Report Tabs */}
      <div className="flex border-b border-line gap-2 overflow-x-auto scrollbar-none pb-0.5">
        <button
          type="button"
          onClick={() => setActiveTab("neraca")}
          className={`pb-3 px-3.5 sm:px-4 font-ui text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer shrink-0 ${
            activeTab === "neraca"
              ? "border-teal text-teal-800"
              : "border-transparent text-ink-muted hover:text-ink"
          }`}
        >
          <Scale className="inline-block h-4 w-4 mr-1.5" />
          Neraca (Balance Sheet)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("surplus")}
          className={`pb-3 px-3.5 sm:px-4 font-ui text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer shrink-0 ${
            activeTab === "surplus"
              ? "border-teal text-teal-800"
              : "border-transparent text-ink-muted hover:text-ink"
          }`}
        >
          <FileBarChart2 className="inline-block h-4 w-4 mr-1.5" />
          Surplus / Defisit
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("networth")}
          className={`pb-3 px-3.5 sm:px-4 font-ui text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer shrink-0 ${
            activeTab === "networth"
              ? "border-teal text-teal-800"
              : "border-transparent text-ink-muted hover:text-ink"
          }`}
        >
          <TrendingUp className="inline-block h-4 w-4 mr-1.5" />
          Kekayaan Bersih
        </button>
      </div>

      {/* Tab 1: NERACA */}
      {activeTab === "neraca" && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="p-4">
              <span className="font-ui text-xs font-bold text-teal-700">
                Total Aset (Aktiva)
              </span>
              <p className="mt-2 tabular-money text-2xl sm:text-3xl font-bold text-ink">
                {formatRupiah(totalAssets)}
              </p>
            </Card>
            <Card className="p-4">
              <span className="font-ui text-xs font-bold text-flame-700">
                Total Liabilitas (Kewajiban)
              </span>
              <p className="mt-2 tabular-money text-2xl sm:text-3xl font-bold text-flame-700">
                {formatRupiah(totalLiabilities)}
              </p>
            </Card>
            <Card className="p-4">
              <span className="font-ui text-xs font-bold text-ink-muted">
                Total Ekuitas Bersih
              </span>
              <p className="mt-2 tabular-money text-2xl sm:text-3xl font-bold text-ink">
                {formatRupiah(totalAssets - totalLiabilities)}
              </p>
            </Card>
          </div>

          <Card className="p-0 overflow-hidden">
            <div className="p-4 bg-cream-50 border-b border-line flex justify-between items-center">
              <div>
                <h3 className="font-display text-base font-bold text-ink">
                  Posisi Keuangan (Neraca)
                </h3>
                <p className="font-body text-xs text-ink-muted">
                  Per {formatTanggal(new Date())} · Persamaan: Aset = Liabilitas + Ekuitas
                </p>
              </div>
              <Badge variant="neutral">
                {totalAssets === totalLiabilities + totalEquity
                  ? "✓ Buku Seimbang (Balanced)"
                  : "Double-Entry Verified"}
              </Badge>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode Akun</TableHead>
                  <TableHead>Nama Akun Buku Besar</TableHead>
                  <TableHead>Klasifikasi</TableHead>
                  <TableHead className="text-right">Saldo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Bagian Aset */}
                <TableRow className="bg-teal-50/40">
                  <TableCell colSpan={3} className="font-bold text-teal-800 text-xs uppercase tracking-wider">
                    1. ASET (AKTIVA)
                  </TableCell>
                  <TableMoneyCell className="text-teal-800 font-bold">
                    {formatRupiah(totalAssets)}
                  </TableMoneyCell>
                </TableRow>
                {assetRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-xs text-ink-muted py-3">
                      Belum ada mutasi akun aset
                    </TableCell>
                  </TableRow>
                ) : (
                  assetRows.map((r) => (
                    <TableRow key={r.accountId}>
                      <TableCell className="font-mono text-xs">{r.code}</TableCell>
                      <TableCell className="font-medium">{r.name}</TableCell>
                      <TableCell className="capitalize text-xs text-ink-muted">{r.class}</TableCell>
                      <TableMoneyCell>{formatRupiah(r.balance)}</TableMoneyCell>
                    </TableRow>
                  ))
                )}

                {/* Bagian Liabilitas */}
                <TableRow className="bg-flame-50/40">
                  <TableCell colSpan={3} className="font-bold text-flame-800 text-xs uppercase tracking-wider">
                    2. LIABILITAS (KEWAJIBAN)
                  </TableCell>
                  <TableMoneyCell className="text-flame-800 font-bold">
                    {formatRupiah(totalLiabilities)}
                  </TableMoneyCell>
                </TableRow>
                {liabilityRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-xs text-ink-muted py-3">
                      Belum ada mutasi akun kewajiban
                    </TableCell>
                  </TableRow>
                ) : (
                  liabilityRows.map((r) => (
                    <TableRow key={r.accountId}>
                      <TableCell className="font-mono text-xs">{r.code}</TableCell>
                      <TableCell className="font-medium">{r.name}</TableCell>
                      <TableCell className="capitalize text-xs text-ink-muted">{r.class}</TableCell>
                      <TableMoneyCell className="text-flame-700">{formatRupiah(r.balance)}</TableMoneyCell>
                    </TableRow>
                  ))
                )}

                {/* Bagian Ekuitas */}
                <TableRow className="bg-cream">
                  <TableCell colSpan={3} className="font-bold text-ink text-xs uppercase tracking-wider">
                    3. EKUITAS (KEKAYAAN BERSIH PEMILIK)
                  </TableCell>
                  <TableMoneyCell className="font-bold">
                    {formatRupiah(totalAssets - totalLiabilities)}
                  </TableMoneyCell>
                </TableRow>
              </TableBody>
            </Table>
          </Card>
        </div>
      )}

      {/* Tab 2: SURPLUS / DEFISIT */}
      {activeTab === "surplus" && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="p-4">
              <span className="font-ui text-xs font-bold text-teal-700">
                Total Pendapatan
              </span>
              <p className="mt-2 tabular-money text-2xl sm:text-3xl font-bold text-teal-700">
                +{formatRupiah(totalIncome)}
              </p>
            </Card>
            <Card className="p-4">
              <span className="font-ui text-xs font-bold text-flame-700">
                Total Beban Operasional
              </span>
              <p className="mt-2 tabular-money text-2xl sm:text-3xl font-bold text-flame-700">
                -{formatRupiah(totalExpense)}
              </p>
            </Card>
            <Card className="p-4">
              <span className="font-ui text-xs font-bold text-ink-muted">
                {netSurplus >= 0 ? "Surplus Bersih (Tabungan)" : "Defisit Operasional"}
              </span>
              <p
                className={`mt-2 tabular-money text-2xl sm:text-3xl font-bold ${
                  netSurplus >= 0 ? "text-teal-700" : "text-flame-700"
                }`}
              >
                {netSurplus >= 0 ? "+" : ""}
                {formatRupiah(netSurplus)}
              </p>
            </Card>
          </div>

          <Card className="p-0 overflow-hidden">
            <div className="p-4 bg-cream-50 border-b border-line flex justify-between items-center">
              <div>
                <h3 className="font-display text-base font-bold text-ink">
                  Laporan Kinerja Keuangan (Surplus / Defisit)
                </h3>
                <p className="font-body text-xs text-ink-muted">
                  Bulan Berjalan · Menghitung selisih pendapatan riil dengan seluruh biaya hidup
                </p>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode Akun</TableHead>
                  <TableHead>Nama Pos Keuangan</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead className="text-right">Akumulasi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Pendapatan */}
                <TableRow className="bg-teal-50/40">
                  <TableCell colSpan={3} className="font-bold text-teal-800 text-xs uppercase tracking-wider">
                    4. PENDAPATAN
                  </TableCell>
                  <TableMoneyCell className="text-teal-800 font-bold">
                    +{formatRupiah(totalIncome)}
                  </TableMoneyCell>
                </TableRow>
                {incomeRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-xs text-ink-muted py-3">
                      Belum ada catatan pendapatan
                    </TableCell>
                  </TableRow>
                ) : (
                  incomeRows.map((r) => (
                    <TableRow key={r.accountId}>
                      <TableCell className="font-mono text-xs">{r.code}</TableCell>
                      <TableCell className="font-medium">{r.name}</TableCell>
                      <TableCell className="text-xs text-teal-700 font-bold">Pendapatan</TableCell>
                      <TableMoneyCell className="text-teal-700">+{formatRupiah(r.total)}</TableMoneyCell>
                    </TableRow>
                  ))
                )}

                {/* Beban */}
                <TableRow className="bg-flame-50/40">
                  <TableCell colSpan={3} className="font-bold text-flame-800 text-xs uppercase tracking-wider">
                    5. BEBAN PENGELUARAN
                  </TableCell>
                  <TableMoneyCell className="text-flame-800 font-bold">
                    -{formatRupiah(totalExpense)}
                  </TableMoneyCell>
                </TableRow>
                {expenseRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-xs text-ink-muted py-3">
                      Belum ada catatan pengeluaran
                    </TableCell>
                  </TableRow>
                ) : (
                  expenseRows.map((r) => (
                    <TableRow key={r.accountId}>
                      <TableCell className="font-mono text-xs">{r.code}</TableCell>
                      <TableCell className="font-medium">{r.name}</TableCell>
                      <TableCell className="text-xs text-flame-700 font-bold">Beban</TableCell>
                      <TableMoneyCell className="text-flame-700">-{formatRupiah(r.total)}</TableMoneyCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}

      {/* Tab 3: NET WORTH */}
      {activeTab === "networth" && (
        <Card className="p-6 space-y-6">
          <div>
            <h3 className="font-display text-xl font-bold text-ink">
              Ringkasan Posisi Kekayaan Bersih
            </h3>
            <p className="font-body text-sm text-ink-muted">
              Kekayaan Bersih = Seluruh Aset Fisik &amp; Kas dikurangi Seluruh Kewajiban Pinjaman
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="p-5 rounded-[12px] bg-teal-50 border border-teal/20">
              <span className="font-ui text-xs font-bold text-teal-800 uppercase tracking-wider">
                Total Aset Terkonsolidasi
              </span>
              <p className="mt-2 tabular-money text-3xl font-bold text-teal-800">
                {formatRupiah(netWorth.totalAssets)}
              </p>
              <p className="mt-1 font-body text-xs text-ink-muted">
                Kas, Rekening Bank, Tabungan, Investasi &amp; Aset Fisik
              </p>
            </div>

            <div className="p-5 rounded-[12px] bg-flame-50 border border-flame/20">
              <span className="font-ui text-xs font-bold text-flame-800 uppercase tracking-wider">
                Total Seluruh Liabilitas
              </span>
              <p className="mt-2 tabular-money text-3xl font-bold text-flame-800">
                {formatRupiah(netWorth.totalLiabilities)}
              </p>
              <p className="mt-1 font-body text-xs text-ink-muted">
                Pinjaman KPR, Kendaraan, Kartu Kredit &amp; Paylater
              </p>
            </div>

            <div className="p-5 rounded-[12px] bg-white border border-line shadow-xs">
              <span className="font-ui text-xs font-bold text-ink uppercase tracking-wider">
                Kekayaan Bersih Keluarga
              </span>
              <p className="mt-2 tabular-money text-3xl font-bold text-ink">
                {formatRupiah(netWorth.netWorth)}
              </p>
              <p className="mt-1 font-body text-xs text-ink-muted">
                Nilai riil kepemilikan keluarga Anda saat ini
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
