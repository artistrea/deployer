import type { DetailedHTMLProps, HTMLAttributes } from "react";
import { cn } from "~/utils/cn";

export function ErrorMessage({
  message,
  className,
  ...htmlProps
}: { message: string | undefined } & DetailedHTMLProps<
  HTMLAttributes<HTMLSpanElement>,
  HTMLSpanElement
>) {
  return (
    <span
      className={cn("h-6 pb-1 text-sm leading-6 text-red-500", className)}
      {...htmlProps}
    >
      {message}
    </span>
  );
}
