"use client";

import React, { useState } from "react";
import { PiggyBank, Plus, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SavingsProgress } from "@/components/ui/progress";
import { EmptyState } from "@/components/ui/empty-state";
import { formatRupiah, formatTanggal } from "@/lib/format";
import { CreateGoalDialog } from "./create-goal-dialog";
import { DepositWithdrawDialog } from "./deposit-withdraw-dialog";
import type { SavingsGoalWithBalance } from "@/lib/data/savings";
import type { AccountWithBalance } from "@/lib/data/accounts";

interface TabunganViewProps {
  householdId: string;
  goals: SavingsGoalWithBalance[];
  accounts: AccountWithBalance[];
}

export function TabunganView({
  householdId,
  goals,
  accounts,
}: TabunganViewProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoalWithBalance | null>(null);
  const [dialogMode, setDialogMode] = useState<"deposit" | "withdraw">("deposit");
  const [dwDialogOpen, setDwDialogOpen] = useState(false);

  const totalSaved = goals.reduce((s, g) => s + g.balance, 0);
  const totalTarget = goals.reduce((s, g) => s + g.target_amount, 0);
  const overallProgress =
    totalTarget > 0 ? Math.min(100, Math.round((totalSaved / totalTarget) * 100)) : 0;

  function openDeposit(goal: SavingsGoalWithBalance) {
    setSelectedGoal(goal);
    setDialogMode("deposit");
    setDwDialogOpen(true);
  }

  function openWithdraw(goal: SavingsGoalWithBalance) {
    setSelectedGoal(goal);
    setDialogMode("withdraw");
    setDwDialogOpen(true);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        badge="Target Masa Depan"
        title="Pos Tabungan Terencana"
        subtitle="Alokasikan tabungan impian (Dana Darurat, Rumah, Liburan, Pendidikan) tanpa mencampurnya dengan kas harian."
        actions={
          <Button variant="primary" onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            <span>Pos Tabungan Baru</span>
          </Button>
        }
      />

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <span className="font-ui text-xs font-bold text-ink-muted">
            Total Terkumpul
          </span>
          <p className="mt-2 tabular-money text-2xl sm:text-3xl font-bold text-teal-700">
            {formatRupiah(totalSaved)}
          </p>
        </Card>
        <Card className="p-4">
          <span className="font-ui text-xs font-bold text-ink-muted">
            Total Target Semua Pos
          </span>
          <p className="mt-2 tabular-money text-2xl sm:text-3xl font-bold text-ink">
            {formatRupiah(totalTarget)}
          </p>
        </Card>
        <Card className="p-4">
          <span className="font-ui text-xs font-bold text-ink-muted">
            Pencapaian Keseluruhan
          </span>
          <p className="mt-2 tabular-money text-2xl sm:text-3xl font-bold text-ink">
            {overallProgress}%
          </p>
        </Card>
      </div>

      {/* Goals Grid / Empty State */}
      {goals.length === 0 ? (
        <EmptyState
          icon={PiggyBank}
          title="Belum Ada Pos Tabungan"
          description="Buat pos tabungan impian keluarga Anda seperti Dana Darurat, Qurban, Liburan, atau DP Rumah."
          actionLabel="+ Buat Pos Tabungan Baru"
          onAction={() => setCreateDialogOpen(true)}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => (
            <Card key={goal.id} className="p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-teal-50 border border-teal/20 text-teal-700">
                    <PiggyBank className="h-5 w-5" />
                  </div>
                  <span className="font-ui text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full">
                    {goal.progressPercent}% Tercapai
                  </span>
                </div>
                <h3 className="mt-3 font-display text-lg font-bold text-ink">
                  {goal.name}
                </h3>
                {goal.description && (
                  <p className="mt-1 font-body text-xs text-ink-muted line-clamp-2">
                    {goal.description}
                  </p>
                )}
              </div>

              <div className="space-y-3 pt-3 border-t border-line">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-ui text-xs font-bold text-ink-muted">
                      Saldo
                    </span>
                    <span className="tabular-money font-bold text-sm text-ink">
                      {formatRupiah(goal.balance)} /{" "}
                      {formatRupiah(goal.target_amount, { compact: true })}
                    </span>
                  </div>
                  <SavingsProgress
                    current={goal.balance}
                    target={goal.target_amount}
                  />
                </div>

                {goal.target_date && (
                  <p className="font-body text-[11px] text-ink-muted">
                    Target: {formatTanggal(goal.target_date)}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => openDeposit(goal)}
                    disabled={accounts.length === 0}
                  >
                    <ArrowDownLeft className="h-3.5 w-3.5" />
                    <span>Setor</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => openWithdraw(goal)}
                    disabled={accounts.length === 0 || goal.balance <= 0}
                  >
                    <ArrowUpRight className="h-3.5 w-3.5" />
                    <span>Tarik</span>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Dialogs */}
      <CreateGoalDialog
        householdId={householdId}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      {selectedGoal && (
        <DepositWithdrawDialog
          mode={dialogMode}
          goal={selectedGoal}
          accounts={accounts}
          open={dwDialogOpen}
          onOpenChange={setDwDialogOpen}
        />
      )}
    </div>
  );
}

