import { redirect } from "next/navigation";
import { getCurrentHousehold } from "@/lib/data/household";
import { getAccounts, getCategories } from "@/lib/data/accounts";
import { getTransactions } from "@/lib/data/transactions";
import { PengeluaranView } from "@/components/features/transactions/pengeluaran-view";

export default async function PengeluaranPage() {
  const household = await getCurrentHousehold();
  if (!household) {
    redirect("/onboarding");
  }

  const [transactions, accounts, categories] = await Promise.all([
    getTransactions(household.id, { type: "expense" }),
    getAccounts(household.id),
    getCategories(household.id, "expense"),
  ]);

  return (
    <PengeluaranView
      householdId={household.id}
      transactions={transactions}
      accounts={accounts}
      categories={categories}
    />
  );
}
