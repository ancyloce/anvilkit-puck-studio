"use client";
import * as React from "react";
import { usePuck } from "@puckeditor/core";
import { LayoutTemplate } from "lucide-react";

// drawerItem + componentItem override
// Puck signature: { children: ReactNode; name: string }
// CRITICAL: must return ReactElement (not undefined/null)
// Puck handles drag internally — we just render the visual
export function DrawerItem({
  children,
  name,
}: {
  children: React.ReactNode;
  name: string;
}): React.ReactElement {
  const { appState } = usePuck();
  const componentConfig = (appState as any).config?.components?.[name];
  const thumbnail: string | undefined = componentConfig?.metadata?.thumbnail;

  return (
    <div className="flex items-center gap-2 rounded-md border border-transparent bg-muted/40 px-3 py-2 text-sm cursor-grab select-none transition-colors hover:bg-muted hover:border-border active:cursor-grabbing mb-1">
      <div className="shrink-0 w-8 h-8 rounded border border-border bg-background flex items-center justify-center overflow-hidden">
        {thumbnail ? (
          <img src={thumbnail} alt={name} className="w-full h-full object-cover" />
        ) : (
          <LayoutTemplate className="w-4 h-4 text-muted-foreground" />
        )}
      </div>
      <span className="truncate font-medium">{name ?? children}</span>
    </div>
  );
}
