import { redirect } from "next/navigation";
import { getCurrentHousehold } from "@/lib/data/household";
import { getAccounts } from "@/lib/data/accounts";
import { RekeningView } from "@/components/features/accounts/rekening-view";

export default async function RekeningPage() {
  const household = await getCurrentHousehold();
  if (!household) {
    redirect("/onboarding");
  }

  const accounts = await getAccounts(household.id);

  return <RekeningView householdId={household.id} accounts={accounts} />;
}
