import * as React from "react";
import { cn } from "@/lib/utils";

interface SavingsProgressProps {
  current: number;
  target: number;
  className?: string;
}

export function SavingsProgress({
  current,
  target,
  className,
}: SavingsProgressProps) {
  const rawPercent = target > 0 ? Math.round((current / target) * 100) : 0;
  const clamped = Math.min(100, Math.max(0, rawPercent));
  const isCompleted = rawPercent >= 100;

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between font-ui text-xs font-bold">
        <span className={isCompleted ? "text-ink" : "text-teal-700"}>
          {rawPercent}% tercapai {isCompleted && "🎉"}
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-cream border border-line/60">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            isCompleted ? "bg-peach" : "bg-teal"
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

