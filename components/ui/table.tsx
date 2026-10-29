import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Tabel sesuai DBD §5:
 * - Header: Archivo Narrow uppercase 13px
 * - Baris: zebra cream-50
 * - Nominal: rata kanan + tabular-nums
 */
export function Table({
  className,
  ...props
}: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto rounded-[16px] border border-line bg-white shadow-tropical">
      <table
        className={cn("w-full caption-bottom text-sm text-ink", className)}
        {...props}
      />
    </div>
  );
}

export function TableHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn("border-b border-line bg-cream/60", className)}
      {...props}
    />
  );
}

export function TableBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody
      className={cn("[&_tr:last-child]:border-0 [&_tr:nth-child(even)]:bg-cream-50/70", className)}
      {...props}
    />
  );
}

export function TableRow({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        "border-b border-line/60 transition-colors hover:bg-cream/40",
        className
      )}
      {...props}
    />
  );
}

export function TableHead({
  className,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "h-11 px-4 text-left align-middle font-display text-[13px] font-bold uppercase tracking-wider text-ink",
        className
      )}
      {...props}
    />
  );
}

export function TableCell({
  className,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn("px-4 py-3 align-middle font-body text-sm text-ink", className)}
      {...props}
    />
  );
}

export function TableMoneyCell({
  className,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn(
        "px-4 py-3 text-right align-middle tabular-money text-sm font-semibold text-ink",
        className
      )}
      {...props}
    />
  );
}

