"use client";
import * as React from "react";
import { usePuck } from "@puckeditor/core";
import { Undo2, Redo2, Download, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// header override — Puck signature: { actions: ReactNode; children: ReactNode }
export function EditorHeader({
  actions,
  children,
}: {
  actions: React.ReactNode;
  children: React.ReactNode;
}): React.ReactElement {
  const { history, appState } = usePuck();

  return (
    <TooltipProvider>
      <header className="flex h-12 items-center justify-between border-b bg-background px-4 gap-2">
        <Button variant="ghost" size="icon">
          <ArrowLeft className="h-4 w-4"></ArrowLeft>
        </Button>

        <div className="flex items-center gap-1">
          {appState?.data?.root?.props?.title || ''}
        </div>

        <div className="flex items-center gap-2">
        <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                disabled={!history.hasPast}
                onClick={() => history.back()}
                aria-label="Undo"
              >
                <Undo2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                disabled={!history.hasFuture}
                onClick={() => history.forward()}
                aria-label="Redo"
              >
                <Redo2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-5 mx-1" />

          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger aria-label="Export" className="inline-flex items-center justify-center rounded-md h-9 w-9 hover:bg-accent hover:text-accent-foreground">
                  <Download className="h-4 w-4" />
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>Export</TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Export JSON</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {actions}
          {/* {children} */}
        </div>
      </header>
    </TooltipProvider>
  );
}

// headerActions override — MUST render {children} (Puck's publish button)
export function EditorHeaderActions({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">{children}</div>
    </TooltipProvider>
  );
}
