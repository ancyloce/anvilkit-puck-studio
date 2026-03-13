"use client";
import * as React from "react";
import { usePuck } from "@puckeditor/core";

function getPlaceholderUrl(name: string): string {
  return `https://picsum.photos/seed/${encodeURIComponent(name)}/120/80`;
}

// drawerItem + componentItem override
// Puck signature: { children: ReactNode; name: string }
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
  const src = thumbnail ?? getPlaceholderUrl(name);

  return (
    <div className="flex flex-col rounded-md border border-border bg-muted/40 cursor-grab select-none transition-colors hover:bg-muted active:cursor-grabbing overflow-hidden">
      <div className="w-full h-16 bg-muted overflow-hidden">
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
        />
      </div>
      <div className="px-2 py-1.5 text-xs font-medium truncate">{name ?? children}</div>
    </div>
  );
}
