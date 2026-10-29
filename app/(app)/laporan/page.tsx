import { redirect } from "next/navigation";
import { getCurrentHousehold } from "@/lib/data/household";
import {
  getBalanceSheet,
  getIncomeStatement,
  getNetWorth,
} from "@/lib/data/reports";
import { LaporanView } from "@/components/features/reports/laporan-view";

export default async function LaporanPage() {
  const household = await getCurrentHousehold();
  if (!household) {
    redirect("/onboarding");
  }

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  const [netWorth, balanceSheet, incomeStatement] = await Promise.all([
    getNetWorth(household.id),
    getBalanceSheet(household.id),
    getIncomeStatement(household.id, startDate, endDate),
  ]);

  return (
    <LaporanView
      householdName={household.name}
      netWorth={netWorth}
      balanceSheet={balanceSheet}
      incomeStatement={incomeStatement}
    />
  );
}
