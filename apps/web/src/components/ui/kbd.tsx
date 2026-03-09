import * as React from "react";

import { cn } from "@/lib/utils";

export interface KbdProps extends React.HTMLAttributes<HTMLElement> {}

function Kbd({ className, children, ...props }: KbdProps) {
  return (
    <kbd
      className={cn(
        "inline-flex items-center justify-center gap-1 rounded border border-white/10 bg-muted/50 px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100",
        className,
      )}
      {...props}
    >
      {children}
    </kbd>
  );
}
Kbd.displayName = "Kbd";

export { Kbd };
