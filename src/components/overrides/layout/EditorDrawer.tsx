"use client";
import * as React from "react";
import { useStore } from "zustand";
import { Search } from "lucide-react";
import { uiStore } from "../../../store/index";
import { ScrollArea } from "../../ui/scroll-area";
import { Input } from "../../ui/input";

// drawer override — Puck signature: { children: ReactNode }
export function EditorDrawer({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const search = useStore(uiStore, (s) => s.drawerSearch);
  const setSearch = useStore(uiStore, (s) => s.setDrawerSearch);

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 pt-3 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Component Library
      </div>
      <div className="p-2">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Search components..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      <ScrollArea className="flex-1">

        {children}
      </ScrollArea>
    </div>
  );
}

// components override — Puck signature: { children: ReactNode }
export function EditorComponents({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div data-puck-components-grid className="p-2">
      <style>{`
        [data-puck-components-grid] [data-puck-drawer] {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 6px;
        }
        /* flatten item wrapper and draggable wrapper */
        [data-puck-components-grid] [data-puck-drawer] > div,
        [data-puck-components-grid] [data-puck-drawer] > div > div {
          display: contents;
        }
        /* hide the ghost/bg copy */
        [data-puck-components-grid] [data-puck-drawer] > div > div > div:first-child {
          display: none;
        }
        /* flatten the real draggable wrapper */
        [data-puck-components-grid] [data-puck-drawer] > div > div > div:last-child {
          display: contents;
        }
      `}</style>
      {children}
    </div>
  );
}
