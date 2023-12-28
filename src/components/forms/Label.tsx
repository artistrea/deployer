import React, { DetailedHTMLProps, LabelHTMLAttributes } from "react";
import { cn } from "~/utils/cn";

type LabelProps = DetailedHTMLProps<
  LabelHTMLAttributes<HTMLLabelElement>,
  HTMLLabelElement
>;

export function Label({ children, className, ...htmlProps }: LabelProps) {
  return (
    <label
      {...htmlProps}
      className={cn("block text-sm leading-6 text-white/80", className)}
    >
      {children}
    </label>
  );
}
