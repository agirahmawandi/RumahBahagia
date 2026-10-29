import { redirect } from "next/navigation";
import { getCurrentHousehold } from "@/lib/data/household";
import { getAccounts } from "@/lib/data/accounts";
import { getAssets } from "@/lib/data/assets";
import { AsetView } from "@/components/features/assets/aset-view";

export default async function AsetPage() {
  const household = await getCurrentHousehold();
  if (!household) {
    redirect("/onboarding");
  }

  const [assets, accounts] = await Promise.all([
    getAssets(household.id),
    getAccounts(household.id),
  ]);

  return (
    <AsetView
      householdId={household.id}
      assets={assets}
      accounts={accounts}
    />
  );
}
