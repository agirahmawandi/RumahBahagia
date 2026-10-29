import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-ui text-xs font-bold transition-colors",
  {
    variants: {
      variant: {
        income: "bg-teal-50 text-teal-700 border border-teal/30",
        expense: "bg-flame-50 text-flame-700 border border-flame/25",
        transfer: "bg-cream text-ink border border-line",
        investment: "bg-peach-100 text-ink border border-peach/40",
        neutral: "bg-cream-50 text-ink-muted border border-line",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

