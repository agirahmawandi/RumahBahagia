import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowDownLeft,
  ArrowUpRight,
  PiggyBank,
  Plus,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle, HeroCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SavingsProgress } from "@/components/ui/progress";
import { formatRupiah, formatTanggal } from "@/lib/format";
import { getCurrentHousehold } from "@/lib/data/household";
import { getNetWorth } from "@/lib/data/reports";
import { getAccounts } from "@/lib/data/accounts";
import { getMonthlyCashFlow, getTransactions } from "@/lib/data/transactions";
import { getSavingsGoals } from "@/lib/data/savings";

export default async function DashboardPage() {
  const household = await getCurrentHousehold();
  if (!household) {
    redirect("/onboarding");
  }

  const [netWorth, accounts, cashFlow, savingsGoals, recentTransactions] =
    await Promise.all([
      getNetWorth(household.id),
      getAccounts(household.id),
      getMonthlyCashFlow(household.id),
      getSavingsGoals(household.id),
      getTransactions(household.id, { limit: 5 }),
    ]);

  // Hitung total kas & bank
  const totalCashAndBank = accounts
    .filter((a) => a.type !== "credit_card")
    .reduce((sum, a) => sum + a.balance, 0);

  const activeAccountsCount = accounts.length;

  const currentMonthName = new Date().toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      <PageHeader
        badge="Ringkasan Keluarga"
        title="Dashboard Keuangan"
        subtitle={`Pantau posisi kekayaan bersih, arus kas bulan ini, dan progres tabungan ${household.name}.`}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/rekening">
              <Button variant="secondary" size="sm">
                <Plus className="h-4 w-4" />
                <span>Tambah Rekening</span>
              </Button>
            </Link>
          </div>
        }
      />

      {/* Top Row: Net Worth + Key Metrics */}
      <div className="grid gap-4 lg:grid-cols-12">
        <HeroCard className="lg:col-span-5 flex flex-col justify-between">
          <div>
            <span className="font-ui text-xs font-bold uppercase tracking-wider text-ink/80">
              Total Kekayaan Bersih (Aset − Utang)
            </span>
            <p className="mt-2 tabular-money text-4xl font-bold text-ink">
              {formatRupiah(netWorth.netWorth)}
            </p>
            <p className="mt-1 font-body text-xs text-ink/80">
              Per {formatTanggal(new Date())} · Buku: {household.name}
            </p>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 rounded-[12px] bg-white/85 p-3.5">
            <div>
              <span className="font-ui text-[11px] font-bold text-teal-700">
                Total Aset
              </span>
              <p className="tabular-money text-lg font-bold text-ink">
                {formatRupiah(netWorth.totalAssets)}
              </p>
            </div>
            <div>
              <span className="font-ui text-[11px] font-bold text-flame-700">
                Total Liabilitas
              </span>
              <p className="tabular-money text-lg font-bold text-flame-700">
                {formatRupiah(netWorth.totalLiabilities)}
              </p>
            </div>
          </div>
        </HeroCard>

        <div className="lg:col-span-7 grid gap-4 sm:grid-cols-3">
          <Card className="flex flex-col justify-between">
            <CardHeader className="pb-1">
              <CardTitle>Total Kas &amp; Bank</CardTitle>
              <Wallet className="h-5 w-5 text-teal-700" strokeWidth={1.75} />
            </CardHeader>
            <div>
              <p className="tabular-money text-2xl sm:text-3xl font-bold text-ink">
                {formatRupiah(totalCashAndBank)}
              </p>
              <p className="mt-1 font-body text-xs text-ink-muted">
                {activeAccountsCount} rekening aktif
              </p>
            </div>
          </Card>

          <Card className="flex flex-col justify-between">
            <CardHeader className="pb-1">
              <CardTitle>Pemasukan Bulan Ini</CardTitle>
              <ArrowDownLeft className="h-5 w-5 text-teal-700" strokeWidth={2} />
            </CardHeader>
            <div>
              <p className="tabular-money text-2xl sm:text-3xl font-bold text-teal-700">
                +{formatRupiah(cashFlow.totalIncome)}
              </p>
              <Badge variant="income" className="mt-2">
                ↑ {currentMonthName}
              </Badge>
            </div>
          </Card>

          <Card className="flex flex-col justify-between">
            <CardHeader className="pb-1">
              <CardTitle>Pengeluaran Bulan Ini</CardTitle>
              <ArrowUpRight className="h-5 w-5 text-flame" strokeWidth={2} />
            </CardHeader>
            <div>
              <p className="tabular-money text-2xl sm:text-3xl font-bold text-flame-700">
                -{formatRupiah(cashFlow.totalExpense)}
              </p>
              <Badge variant="expense" className="mt-2">
                ↓ {currentMonthName}
              </Badge>
            </div>
          </Card>
        </div>
      </div>

      {/* Second Row: Pos Tabungan & Transaksi Terakhir */}
      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PiggyBank className="h-5 w-5 text-teal-700" />
              <h2 className="font-display text-xl font-bold text-ink">
                Progres Pos Tabungan
              </h2>
            </div>
            <Link
              href="/tabungan"
              className="font-ui text-xs font-bold text-teal-700 hover:underline"
            >
              Kelola Pos →
            </Link>
          </div>

          {savingsGoals.length === 0 ? (
            <div className="rounded-[12px] border border-dashed border-line bg-cream-50/60 p-6 text-center">
              <p className="font-ui text-sm font-bold text-ink">
                Belum ada pos tabungan
              </p>
              <p className="mt-1 font-body text-xs text-ink-muted">
                Buat pos tabungan impian keluarga seperti Dana Darurat, Liburan, atau Pendidikan.
              </p>
              <Link href="/tabungan" className="inline-block mt-3">
                <Button variant="secondary" size="sm">
                  + Buat Pos Tabungan
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {savingsGoals.slice(0, 3).map((goal) => (
                <div
                  key={goal.id}
                  className="rounded-[12px] border border-line bg-cream-50 p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-ui text-sm font-bold text-ink">
                      {goal.name}
                    </span>
                    <span className="tabular-money text-sm font-bold text-ink">
                      {formatRupiah(goal.balance)} /{" "}
                      {formatRupiah(goal.target_amount, { compact: true })}
                    </span>
                  </div>
                  <SavingsProgress
                    current={goal.balance}
                    target={goal.target_amount}
                  />
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-peach" />
              <h2 className="font-display text-xl font-bold text-ink">
                Transaksi Terakhir
              </h2>
            </div>
            <Link
              href="/pengeluaran"
              className="font-ui text-xs font-bold text-teal-700 hover:underline"
            >
              Lihat Semua →
            </Link>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="rounded-[12px] border border-dashed border-line bg-cream-50/60 p-6 text-center">
              <p className="font-ui text-sm font-bold text-ink">
                Belum ada transaksi tercatat
              </p>
              <p className="mt-1 font-body text-xs text-ink-muted">
                Mulai dengan menambahkan rekening pertama Anda, lalu catat pemasukan atau pengeluaran harian.
              </p>
            </div>
          ) : (
            <div className="space-y-2 divide-y divide-line/60">
              {recentTransactions.map((tx) => {
                const isIncome = tx.type === "income";
                const isExpense = tx.type === "expense";
                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between pt-2.5 first:pt-0"
                  >
                    <div>
                      <p className="font-ui text-sm font-bold text-ink">
                        {tx.description}
                      </p>
                      <p className="font-body text-xs text-ink-muted">
                        {formatTanggal(tx.entry_date)}
                      </p>
                    </div>
                    <span
                      className={`tabular-money font-display font-bold text-base ${
                        isIncome
                          ? "text-teal-700"
                          : isExpense
                          ? "text-flame-700"
                          : "text-ink"
                      }`}
                    >
                      {isIncome ? "+" : isExpense ? "-" : ""}
                      {formatRupiah(tx.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
