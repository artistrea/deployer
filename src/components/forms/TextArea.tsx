import React, {
  type DetailedHTMLProps,
  type TextareaHTMLAttributes,
} from "react";
import { cn } from "~/utils/cn";

export const TextArea = React.forwardRef<
  HTMLTextAreaElement,
  DetailedHTMLProps<
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    HTMLTextAreaElement
  >
>(({ className, ...htmlProps }, ref) => {
  return (
    <textarea
      {...htmlProps}
      ref={ref}
      className={cn(
        "rounded-sm bg-zinc-200/5 p-2 focus-visible:bg-zinc-200/15 focus-visible:outline focus-visible:outline-1 focus-visible:outline-current",
        className,
      )}
    />
  );
});
