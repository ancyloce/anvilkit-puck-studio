"use client";
import * as React from "react";
import { usePuck } from "@puckeditor/core";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

// outline override — Puck signature: { children: ReactNode }
export function EditorOutline({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const { selectedItem } = usePuck();

  return (
    <div className="flex h-full flex-col">
      <div className="px-3 py-2 border-b border-border">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Outline
        </span>
      </div>
      {selectedItem && (
        <>
          <div className="px-3 py-1.5 text-xs text-muted-foreground truncate">
            Selected:{" "}
            <span className="font-medium text-foreground">
              {typeof selectedItem.type === "string"
                ? selectedItem.type
                : String(selectedItem.type)}
            </span>
          </div>
          <Separator />
        </>
      )}
      <ScrollArea className="flex-1">
        <div className="p-2 text-sm">{children}</div>
      </ScrollArea>
    </div>
  );
}
