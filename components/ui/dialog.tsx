"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="fixed inset-0"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-lg rounded-t-[24px] sm:rounded-[16px] border-t sm:border border-line bg-white p-5 sm:p-6 shadow-tropical animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 max-h-[88vh] sm:max-h-[90vh] overflow-y-auto pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] sm:pb-6">
        {/* Mobile Pull / Drag Indicator */}
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-line sm:hidden" />
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 pb-4 border-b border-line/60", className)}
      {...props}
    />
  );
}

export function DialogTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn("font-display text-xl font-bold text-ink", className)}
      {...props}
    />
  );
}

export function DialogDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("font-body text-xs text-ink-muted", className)}
      {...props}
    />
  );
}

export function DialogClose({
  onClose,
}: {
  onClose: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClose}
      className="absolute right-4 top-4 rounded-[8px] p-1.5 text-ink-muted hover:bg-cream hover:text-ink cursor-pointer"
    >
      <X className="h-5 w-5" />
    </button>
  );
}

