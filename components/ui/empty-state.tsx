import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { Button } from "./button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[16px] border border-dashed border-line bg-white/80 px-6 py-12 text-center shadow-tropical">
      <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 border border-teal/30">
        <div className="absolute -right-1.5 -top-1.5 h-5 w-5 rounded-full bg-peach/80" />
        <Icon className="h-8 w-8 text-teal-700" strokeWidth={1.75} />
      </div>
      <h3 className="font-display text-xl font-bold text-ink">{title}</h3>
      <p className="mt-1.5 max-w-md font-body text-sm text-ink-muted">
        {description}
      </p>
      {actionLabel && (
        <div className="mt-5">
          <Button variant="primary" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}

