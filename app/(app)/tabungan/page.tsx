import { redirect } from "next/navigation";
import { getCurrentHousehold } from "@/lib/data/household";
import { getAccounts } from "@/lib/data/accounts";
import { getSavingsGoals } from "@/lib/data/savings";
import { TabunganView } from "@/components/features/savings/tabungan-view";

export default async function TabunganPage() {
  const household = await getCurrentHousehold();
  if (!household) {
    redirect("/onboarding");
  }

  const [goals, accounts] = await Promise.all([
    getSavingsGoals(household.id),
    getAccounts(household.id),
  ]);

  return (
    <TabunganView
      householdId={household.id}
      goals={goals}
      accounts={accounts}
    />
  );
}
