import { type VariantProps, cva } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import * as React from "react";
import { primaryButtonClass, outlineButtonClass, focusRingClass } from "@/lib/brand-colors";
import { linkButtonClass } from "@/lib/link-button";
import { cn } from "@/lib/utils";

const buttonMotion =
  "transition-all duration-200 ease-out active:scale-[0.98] disabled:active:scale-100";

const buttonVariants = cva(
  cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold",
    buttonMotion,
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    focusRingClass,
    "disabled:pointer-events-none disabled:opacity-50"
  ),
  {
    variants: {
      variant: {
        default: primaryButtonClass,
        secondary:
          "border border-current bg-[#F8FAFC] text-[#334155] shadow-sm hover:bg-[#94A98F]/15 hover:shadow-md active:bg-[#94A98F]/25 active:shadow-sm",
        outline: outlineButtonClass,
        ghost: "text-[#334155] hover:bg-[#F8FAFC] active:bg-[#94A98F]/10",
        link: linkButtonClass,
        destructive:
          "bg-red-600 text-white shadow-sm hover:bg-red-700 hover:shadow-md active:bg-red-800 active:shadow-sm",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 rounded-full px-3",
        lg: "h-12 rounded-full px-8 text-base",
        icon: "h-11 w-11",
      },
    },
    compoundVariants: [
      {
        variant: "link",
        class:
          "h-auto min-h-0 rounded-none px-0 py-0 font-medium shadow-none hover:bg-transparent active:scale-100",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants, buttonMotion };
