import { WalletCards, X } from "lucide-react";
import type { MouseEventHandler, PropsWithChildren } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

type Props = PropsWithChildren<{
  title: string;
  actionGroups: {
    text: string;
    onClick: MouseEventHandler<HTMLDivElement>;
  }[][];
}>;

export function ActionsDropdown({ children, actionGroups, title }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56"
        onCloseAutoFocus={(e) => e.preventDefault()}
        onFocusOutside={(e) => e.preventDefault()}
      >
        <DropdownMenuLabel className="flex items-center">
          <WalletCards className="mr-2 h-5 w-5" />
          <span>{title}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {actionGroups.map((actions) => {
          if (actions.length === 1)
            return (
              <>
                <DropdownMenuItem onClick={actions[0]?.onClick}>
                  <span>{actions[0]?.text}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            );

          return (
            <>
              <DropdownMenuGroup>
                {actions.map((action, i) => (
                  <DropdownMenuItem key={i} onClick={action.onClick}>
                    <span>{action.text}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
            </>
          );
        })}
        <DropdownMenuItem className="text-red-500 focus:bg-red-500/20">
          <X className="mr-2 h-4 w-4" />
          <span>Cancelar</span>
          <DropdownMenuShortcut>Esc</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
