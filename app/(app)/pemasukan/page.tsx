import { redirect } from "next/navigation";
import { getCurrentHousehold } from "@/lib/data/household";
import { getAccounts, getCategories } from "@/lib/data/accounts";
import { getTransactions } from "@/lib/data/transactions";
import { PemasukanView } from "@/components/features/transactions/pemasukan-view";

export default async function PemasukanPage() {
  const household = await getCurrentHousehold();
  if (!household) {
    redirect("/onboarding");
  }

  const [transactions, accounts, categories] = await Promise.all([
    getTransactions(household.id, { type: "income" }),
    getAccounts(household.id),
    getCategories(household.id, "income"),
  ]);

  return (
    <PemasukanView
      householdId={household.id}
      transactions={transactions}
      accounts={accounts}
      categories={categories}
    />
  );
}
