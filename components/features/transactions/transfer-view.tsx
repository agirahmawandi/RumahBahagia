"use client";

import React, { useState } from "react";
import { ArrowLeftRight, Plus } from "lucide-react";
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
import { CreateTransferDialog } from "./create-transfer-dialog";
import type { TransactionItem } from "@/lib/data/transactions";
import type { AccountWithBalance } from "@/lib/data/accounts";

interface TransferViewProps {
  householdId: string;
  transactions: TransactionItem[];
  accounts: AccountWithBalance[];
}

export function TransferView({
  householdId,
  transactions,
  accounts,
}: TransferViewProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const totalTransfer = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  const count = transactions.length;

  return (
    <div className="space-y-6">
      <PageHeader
        badge="Mutasi Antar Kas"
        title="Transfer Rekening"
        subtitle="Pindahkan dana antar rekening bank, tarik tunai, top-up e-wallet, beserta pencatatan biaya admin bank."
        actions={
          <Button
            variant="primary"
            onClick={() => setDialogOpen(true)}
            disabled={accounts.length < 2}
            title={
              accounts.length < 2
                ? "Dibutuhkan minimal 2 rekening untuk membuat transfer"
                : undefined
            }
          >
            <Plus className="h-4 w-4" />
            <span>Transfer Baru</span>
          </Button>
        }
      />

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-4">
          <span className="font-ui text-xs font-bold text-ink-muted">
            Total Volume Transfer
          </span>
          <p className="mt-2 tabular-money text-2xl sm:text-3xl font-bold text-ink">
            {formatRupiah(totalTransfer)}
          </p>
        </Card>
        <Card className="p-4">
          <span className="font-ui text-xs font-bold text-ink-muted">
            Jumlah Mutasi
          </span>
          <p className="mt-2 tabular-money text-2xl sm:text-3xl font-bold text-ink">
            {count}
          </p>
        </Card>
      </div>

      {/* Table / Empty State */}
      {transactions.length === 0 ? (
        <EmptyState
          icon={ArrowLeftRight}
          title="Belum Ada Riwayat Transfer"
          description={
            accounts.length < 2
              ? "Tambahkan minimal 2 rekening di menu Rekening agar dapat memindahkan saldo antar akun."
              : "Pindahkan saldo dari Bank ke Dompet Tunai atau Top-up E-Wallet keluarga Anda."
          }
          actionLabel={accounts.length >= 2 ? "+ Buat Transfer Baru" : undefined}
          onAction={accounts.length >= 2 ? () => setDialogOpen(true) : undefined}
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
                    <Badge variant="neutral">Transfer</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-ink-muted">
                    {tx.created_by_name || "Anggota"}
                  </TableCell>
                  <TableMoneyCell className="text-ink font-bold">
                    {formatRupiah(tx.amount)}
                  </TableMoneyCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Dialog */}
      <CreateTransferDialog
        householdId={householdId}
        accounts={accounts}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}

