import { Skeleton } from "@/components/ui/skeleton";

export default function AppLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-5 w-32 rounded-full" />
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-28 w-full rounded-[16px]" />
        <Skeleton className="h-28 w-full rounded-[16px]" />
        <Skeleton className="h-28 w-full rounded-[16px]" />
        <Skeleton className="h-28 w-full rounded-[16px]" />
      </div>

      <Skeleton className="h-64 w-full rounded-[16px]" />
    </div>
  );
}

