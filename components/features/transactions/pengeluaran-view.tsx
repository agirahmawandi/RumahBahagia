"use client";

import React, { useState } from "react";
import { ArrowUpRight, Plus } from "lucide-react";
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
import { CreateExpenseDialog } from "./create-expense-dialog";
import type { TransactionItem } from "@/lib/data/transactions";
import type { AccountWithBalance, CategoryItem } from "@/lib/data/accounts";

interface PengeluaranViewProps {
  householdId: string;
  transactions: TransactionItem[];
  accounts: AccountWithBalance[];
  categories: CategoryItem[];
}

export function PengeluaranView({
  householdId,
  transactions,
  accounts,
  categories,
}: PengeluaranViewProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const totalExpense = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  const count = transactions.length;
  const averageExpense = count > 0 ? totalExpense / count : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        badge="Arus Kas Keluar"
        title="Catatan Pengeluaran"
        subtitle="Kelola dan audit seluruh belanja harian, tagihan rutin, biaya dapur, dan edukasi anak."
        actions={
          <Button variant="primary" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            <span>Catat Pengeluaran</span>
          </Button>
        }
      />

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <span className="font-ui text-xs font-bold text-ink-muted">
            Total Pengeluaran Tercatat
          </span>
          <p className="mt-2 tabular-money text-2xl sm:text-3xl font-bold text-flame-700">
            -{formatRupiah(totalExpense)}
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
            {formatRupiah(averageExpense)}
          </p>
        </Card>
      </div>

      {/* Table / Empty State */}
      {transactions.length === 0 ? (
        <EmptyState
          icon={ArrowUpRight}
          title="Belum Ada Pengeluaran Tercatat"
          description="Catat pengeluaran belanja makanan, tagihan bulanan, atau bensin pertama Anda."
          actionLabel="+ Catat Pengeluaran Pertama"
          onAction={() => setDialogOpen(true)}
        />
      ) : (
        <Card className="p-0 overflow-hidden">
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
                    <Badge variant="expense">Pengeluaran</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-ink-muted">
                    {tx.created_by_name || "Anggota"}
                  </TableCell>
                  <TableMoneyCell className="text-flame-700 font-bold">
                    -{formatRupiah(tx.amount)}
                  </TableMoneyCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Dialog */}
      <CreateExpenseDialog
        householdId={householdId}
        accounts={accounts}
        categories={categories}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}

