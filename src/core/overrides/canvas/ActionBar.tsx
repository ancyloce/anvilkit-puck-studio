"use client";
import * as React from "react";
import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";

// actionBar override — Puck signature: { children: ReactNode; label?: string; parentAction: ReactNode }
// We render Puck's built-in children (which include delete/duplicate) + label + parentAction
export function ActionBar({
  children,
  label,
  parentAction,
}: {
  children: React.ReactNode;
  label?: string;
  parentAction: React.ReactNode;
}): React.ReactElement {
  return (
    <TooltipProvider>
      <div className="flex items-center gap-0.5 rounded-md border bg-background shadow-md px-1 py-0.5">
        {label && (
          <>
            <span className="px-2 text-xs font-medium text-muted-foreground truncate max-w-[120px]">
              {label}
            </span>
            <Separator orientation="vertical" className="h-5" />
          </>
        )}

        {parentAction && (
          <>
            {parentAction}
            <Separator orientation="vertical" className="h-5" />
          </>
        )}

        {/* Puck's built-in action buttons (duplicate, delete, move) */}
        {children}
      </div>
    </TooltipProvider>
  );
}
