import React from "react";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  badge?: string;
  actions?: React.ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  badge,
  actions,
}: PageHeaderProps) {
  return (
    <div className="mb-5 sm:mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        {badge && (
          <span className="mb-1.5 inline-block rounded-full bg-cream px-3 py-0.5 font-ui text-[11px] font-bold uppercase tracking-wider text-ink border border-line">
            {badge}
          </span>
        )}
        <h1 className="font-display text-2xl sm:text-[32px] sm:leading-[38px] font-bold text-ink tracking-tight">
          {title}
        </h1>
        <p className="mt-0.5 font-body text-xs sm:text-sm text-ink-muted leading-relaxed">
          {subtitle}
        </p>
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}

