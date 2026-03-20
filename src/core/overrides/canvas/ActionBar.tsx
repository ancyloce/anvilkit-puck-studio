"use client";
import * as React from "react";
import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useCanvasZoom } from "@/store/editor-ui";

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
  const canvasZoom = useCanvasZoom();

  return (
    <TooltipProvider>
      <div
        className="flex items-center gap-0.5 rounded-md border border-border bg-background shadow-md px-1 py-0.5"
        style={{
          transform: canvasZoom === 1 ? undefined : `scale(${1 / canvasZoom})`,
          transformOrigin: "top left",
        }}
      >
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
