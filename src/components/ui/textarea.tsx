import * as React from "react";
import { inputFocusRingClass } from "@/lib/brand-colors";
import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[100px] w-full min-w-0 rounded-xl border border-slate-200 bg-white px-4 py-3 text-base placeholder:text-slate-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm",
          inputFocusRingClass,
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
