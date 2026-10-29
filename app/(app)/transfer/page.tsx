import { redirect } from "next/navigation";
import { getCurrentHousehold } from "@/lib/data/household";
import { getAccounts } from "@/lib/data/accounts";
import { getTransactions } from "@/lib/data/transactions";
import { TransferView } from "@/components/features/transactions/transfer-view";

export default async function TransferPage() {
  const household = await getCurrentHousehold();
  if (!household) {
    redirect("/onboarding");
  }

  const [transactions, accounts] = await Promise.all([
    getTransactions(household.id, { type: "transfer" }),
    getAccounts(household.id),
  ]);

  return (
    <TransferView
      householdId={household.id}
      transactions={transactions}
      accounts={accounts}
    />
  );
}
