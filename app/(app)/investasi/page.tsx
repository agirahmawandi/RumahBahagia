import { redirect } from "next/navigation";
import { getCurrentHousehold } from "@/lib/data/household";
import { getAccounts } from "@/lib/data/accounts";
import { getInvestments } from "@/lib/data/investments";
import { InvestasiView } from "@/components/features/investments/investasi-view";

export default async function InvestasiPage() {
  const household = await getCurrentHousehold();
  if (!household) {
    redirect("/onboarding");
  }

  const [investments, accounts] = await Promise.all([
    getInvestments(household.id),
    getAccounts(household.id),
  ]);

  return (
    <InvestasiView
      householdId={household.id}
      investments={investments}
      accounts={accounts}
    />
  );
}
