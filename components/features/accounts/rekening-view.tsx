"use client";

import React, { useState } from "react";
import {
  Banknote,
  CreditCard,
  Landmark,
  Plus,
  Smartphone,
  Wallet,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatRupiah } from "@/lib/format";
import { CreateAccountDialog } from "./create-account-dialog";
import type { AccountWithBalance } from "@/lib/data/accounts";

interface RekeningViewProps {
  householdId: string;
  accounts: AccountWithBalance[];
}

export function RekeningView({ householdId, accounts }: RekeningViewProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Hitung total per grup
  const totalCash = accounts
    .filter((a) => a.type === "cash")
    .reduce((s, a) => s + a.balance, 0);

  const totalBank = accounts
    .filter((a) => a.type === "bank")
    .reduce((s, a) => s + a.balance, 0);

  const totalEwallet = accounts
    .filter((a) => a.type === "ewallet")
    .reduce((s, a) => s + a.balance, 0);

  const totalCreditCard = accounts
    .filter((a) => a.type === "credit_card")
    .reduce((s, a) => s + a.balance, 0);

  const ACCOUNT_GROUPS = [
    { label: "Tunai (Cash)", icon: Banknote, total: totalCash, color: "text-teal-700" },
    { label: "Bank", icon: Landmark, total: totalBank, color: "text-teal-700" },
    { label: "E-Wallet", icon: Smartphone, total: totalEwallet, color: "text-peach" },
    { label: "Kartu Kredit", icon: CreditCard, total: totalCreditCard, color: "text-flame-700" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        badge="Akun Kas & Liabilitas"
        title="Daftar Rekening"
        subtitle="Kelola semua rekening Bank, Dompet Tunai, E-Wallet, dan Kartu Kredit dengan saldo riil terintegrasi buku besar."
        actions={
          <Button variant="primary" onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            <span>Tambah Rekening</span>
          </Button>
        }
      />

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ACCOUNT_GROUPS.map((group) => {
          const Icon = group.icon;
          return (
            <Card key={group.label} className="p-4">
              <div className="flex items-center justify-between text-ink-muted">
                <span className="font-ui text-xs font-bold">{group.label}</span>
                <Icon className={`h-4 w-4 ${group.color}`} strokeWidth={1.75} />
              </div>
              <p className="mt-2 tabular-money text-2xl font-bold text-ink">
                {formatRupiah(group.total)}
              </p>
            </Card>
          );
        })}
      </div>

      {/* Accounts List / Empty State */}
      {accounts.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="Tambah Rekening Pertama Anda"
          description="Mulai dengan membuat rekening Dompet Tunai (Cash) atau rekening Bank utama beserta saldo awalnya."
          actionLabel="+ Buat Rekening Baru"
          onAction={() => setCreateDialogOpen(true)}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((acc) => {
            const isCC = acc.type === "credit_card";
            return (
              <Card key={acc.id} className="p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <Badge variant={isCC ? "expense" : "neutral"} className="capitalize">
                      {acc.type.replace("_", " ")}
                    </Badge>
                    {acc.institution && (
                      <span className="font-ui text-xs font-bold text-ink-muted">
                        {acc.institution}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-3 font-display text-lg font-bold text-ink">
                    {acc.name}
                  </h3>
                  {acc.account_number_last4 && (
                    <p className="font-mono text-xs text-ink-muted">
                      •••• {acc.account_number_last4}
                    </p>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-line">
                  <span className="font-ui text-[11px] font-bold text-ink-muted uppercase tracking-wider block">
                    {isCC ? "Tagihan Berjalan" : "Saldo Saat Ini"}
                  </span>
                  <p
                    className={`tabular-money text-2xl font-bold ${
                      isCC ? "text-flame-700" : "text-ink"
                    }`}
                  >
                    {formatRupiah(acc.balance)}
                  </p>
                  {isCC && acc.credit_limit > 0 && (
                    <p className="mt-1 font-body text-xs text-ink-muted">
                      Limit: {formatRupiah(acc.credit_limit)}
                    </p>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Dialog Tambah Rekening */}
      <CreateAccountDialog
        householdId={householdId}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  );
}

