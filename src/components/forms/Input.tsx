import React, { DetailedHTMLProps, InputHTMLAttributes } from "react";
import { cn } from "~/utils/cn";

export const Input = React.forwardRef<
  HTMLInputElement,
  DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>
>(({ className, ...htmlProps }, ref) => {
  return (
    <input
      {...htmlProps}
      ref={ref}
      className={cn(
        "rounded-sm bg-zinc-200/5 p-2 focus-visible:bg-zinc-200/15 focus-visible:outline focus-visible:outline-1 focus-visible:outline-current",
        className,
      )}
    />
  );
});
