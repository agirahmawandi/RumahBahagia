"use client";

import React, { useState } from "react";
import { ArrowDownLeft, Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
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
import { CreateIncomeDialog } from "./create-income-dialog";
import type { TransactionItem } from "@/lib/data/transactions";
import type { AccountWithBalance, CategoryItem } from "@/lib/data/accounts";

interface PemasukanViewProps {
  householdId: string;
  transactions: TransactionItem[];
  accounts: AccountWithBalance[];
  categories: CategoryItem[];
}

export function PemasukanView({
  householdId,
  transactions,
  accounts,
  categories,
}: PemasukanViewProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const totalIncome = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  const count = transactions.length;
  const averageIncome = count > 0 ? totalIncome / count : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        badge="Arus Kas Masuk"
        title="Catatan Pemasukan"
        subtitle="Pantau seluruh aliran pendapatan keluarga: gaji, bonus, dividen, dan usaha harian."
        actions={
          <Button variant="primary" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            <span>Catat Pemasukan</span>
          </Button>
        }
      />

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <span className="font-ui text-xs font-bold text-ink-muted">
            Total Pemasukan Tercatat
          </span>
          <p className="mt-2 tabular-money text-2xl sm:text-3xl font-bold text-teal-700">
            +{formatRupiah(totalIncome)}
          </p>
        </Card>
        <Card className="p-4">
          <span className="font-ui text-xs font-bold text-ink-muted">
            Jumlah Transaksi
          </span>
          <p className="mt-2 tabular-money text-2xl sm:text-3xl font-bold text-ink">
            {count}
          </p>
        </Card>
        <Card className="p-4">
          <span className="font-ui text-xs font-bold text-ink-muted">
            Rata-rata per Transaksi
          </span>
          <p className="mt-2 tabular-money text-2xl sm:text-3xl font-bold text-ink">
            {formatRupiah(averageIncome)}
          </p>
        </Card>
      </div>

      {/* Table / Empty State */}
      {transactions.length === 0 ? (
        <EmptyState
          icon={ArrowDownLeft}
          title="Belum Ada Pemasukan Tercatat"
          description="Catat penerimaan gaji, honor, atau hasil usaha pertama Anda untuk mulai mengisi buku kas."
          actionLabel="+ Catat Pemasukan Pertama"
          onAction={() => setDialogOpen(true)}
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          {/* Mobile Card / List View */}
          <div className="divide-y divide-line/60 sm:hidden">
            {transactions.map((tx) => (
              <div key={tx.id} className="p-3.5 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-body text-xs text-ink-muted">
                      {formatTanggal(tx.entry_date)}
                    </span>
                    <Badge variant="income" className="text-[10px] py-0 px-1.5">
                      Pemasukan
                    </Badge>
                  </div>
                  <p className="font-ui text-sm font-bold text-ink truncate">
                    {tx.description}
                  </p>
                  <p className="font-body text-xs text-ink-muted truncate">
                    Oleh: {tx.created_by_name || "Anggota"}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="tabular-money font-display font-bold text-base text-teal-700">
                    +{formatRupiah(tx.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Keterangan</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Dicatat Oleh</TableHead>
                  <TableHead className="text-right">Nominal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="font-medium text-xs whitespace-nowrap">
                      {formatTanggal(tx.entry_date)}
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-ink">{tx.description}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="income">Pemasukan</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-ink-muted">
                      {tx.created_by_name || "Anggota"}
                    </TableCell>
                    <TableMoneyCell className="text-teal-700 font-bold">
                      +{formatRupiah(tx.amount)}
                    </TableMoneyCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Dialog */}
      <CreateIncomeDialog
        householdId={householdId}
        accounts={accounts}
        categories={categories}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}

