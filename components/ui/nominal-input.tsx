"use client";

import * as React from "react";
import { formatNominalInput, parseNominalInput } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface NominalInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "value" | "onChange"
  > {
  value?: number;
  onValueChange?: (value: number) => void;
}

export const NominalInput = React.forwardRef<
  HTMLInputElement,
  NominalInputProps
>(({ className, value = 0, onValueChange, ...props }, ref) => {
  const [display, setDisplay] = React.useState(() =>
    value ? formatNominalInput(value) : ""
  );

  React.useEffect(() => {
    setDisplay(value ? formatNominalInput(value) : "");
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const formatted = formatNominalInput(raw);
    setDisplay(formatted);
    onValueChange?.(parseNominalInput(formatted));
  };

  return (
    <div className="relative flex items-center">
      <span className="pointer-events-none absolute left-3.5 font-display text-base font-bold text-ink-muted">
        Rp
      </span>
      <input
        ref={ref}
        type="text"
        inputMode="numeric"
        value={display}
        onChange={handleChange}
        placeholder="0"
        className={cn(
          "flex h-11 w-full rounded-[12px] border border-line bg-white pl-10 pr-3.5 py-2 tabular-money text-lg font-bold text-ink placeholder:text-ink-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:border-teal",
          className
        )}
        {...props}
      />
    </div>
  );
});
NominalInput.displayName = "NominalInput";

