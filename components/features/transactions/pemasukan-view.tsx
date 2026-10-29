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

