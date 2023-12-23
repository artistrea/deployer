import { ClassValue } from "clsx";
import { CheckSquare, Copy, CopyCheck } from "lucide-react";
import { useState } from "react";
import { cn } from "~/utils/cn";

type Props = {
  textToCopy: string;
  className?: ClassValue;
};

export function CopyToClipboard({ textToCopy, className }: Props) {
  const [justCopied, setJustCopied] = useState(false);

  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(textToCopy);
        setJustCopied(true);
        setTimeout(() => setJustCopied(false), 2000);
      }}
      className={cn(className)}
      title={justCopied ? "Código copiado" : "Copie o código"}
    >
      <div className="relative flex h-10 w-10 items-center justify-center">
        <CheckSquare
          className={cn("scale-80 absolute opacity-0 transition-all", {
            "scale-100 opacity-100": justCopied,
          })}
        />
        <Copy
          className={cn("absolute transition-all", {
            "scale-80 opacity-0": justCopied,
          })}
        />
      </div>
    </button>
  );
}
