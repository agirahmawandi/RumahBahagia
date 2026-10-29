import { redirect } from "next/navigation";
import { getCurrentHousehold } from "@/lib/data/household";
import { getAccounts } from "@/lib/data/accounts";
import { getLiabilities } from "@/lib/data/liabilities";
import { UtangView } from "@/components/features/liabilities/utang-view";

export default async function UtangPage() {
  const household = await getCurrentHousehold();
  if (!household) {
    redirect("/onboarding");
  }

  const [liabilities, accounts] = await Promise.all([
    getLiabilities(household.id),
    getAccounts(household.id),
  ]);

  return (
    <UtangView
      householdId={household.id}
      liabilities={liabilities}
      accounts={accounts}
    />
  );
}
