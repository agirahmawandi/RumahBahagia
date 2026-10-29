import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[12px] font-ui font-bold text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        primary:
          "bg-teal text-ink hover:bg-teal-700 hover:text-white shadow-xs",
        secondary:
          "border border-ink bg-transparent text-ink hover:bg-cream",
        danger:
          "bg-flame text-white hover:bg-flame-700 shadow-xs",
        ghost:
          "bg-transparent text-ink hover:bg-cream/70",
        subtle:
          "bg-cream text-ink hover:bg-peach-100",
      },
      size: {
        default: "h-11 px-4 py-2.5",
        sm: "h-9 px-3 text-xs rounded-[10px]",
        lg: "h-12 px-6 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { buttonVariants };

