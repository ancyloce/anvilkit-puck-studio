"use client";
import * as React from "react";
import { usePuck } from "@puckeditor/core";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Info } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

type BreadcrumbSegment = { label: string; onSelect?: () => void };

function useBreadcrumbs(): BreadcrumbSegment[] {
  const { appState, dispatch, selectedItem, getParentById } = usePuck();
  const { itemSelector } = appState.ui;

  const selectRoot = () =>
    dispatch({ type: "setUi", ui: { itemSelector: null } });

  if (!itemSelector || !selectedItem) {
    return [{ label: "Page" }];
  }

  const selectedType = (selectedItem as any).type ?? "Component";
  const parent = getParentById((selectedItem as any).props?.id ?? "");

  if (!parent) {
    // Top-level component
    return [{ label: "Page", onSelect: selectRoot }, { label: selectedType }];
  }

  // Nested component — show parent type as intermediate crumb when available
  const parentType = (parent as any).type ?? "Component";
  return [
    { label: "Page", onSelect: selectRoot },
    { label: parentType },
    { label: selectedType },
  ];
}

// fields override — exact Puck signature: { children, isLoading, itemSelector }
export function FieldWrapper({
  children,
}: {
  children?: React.ReactNode;
  isLoading?: boolean;
  itemSelector?: unknown;
}): React.ReactElement {
  const crumbs = useBreadcrumbs();

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-0">
        <div className="px-3 py-2 border-b">
          <Breadcrumb>
            <BreadcrumbList>
              {crumbs.map((crumb, i) => {
                const isLast = i === crumbs.length - 1;
                return (
                  <React.Fragment key={i}>
                    {i > 0 && <BreadcrumbSeparator />}
                    <BreadcrumbItem>
                      {isLast ? (
                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink
                          className="cursor-pointer"
                          onClick={crumb.onSelect}
                        >
                          {crumb.label}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </React.Fragment>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        {children}
      </div>
    </ScrollArea>
  );
}

// fieldLabel override — exact Puck signature: { children?, icon?, label, el?, readOnly?, className? }
export function FieldLabel({
  children,
  label,
  labelIcon,
  el,
  type: _type,
  readOnly,
  className,
}: {
  children?: React.ReactNode;
  labelIcon?: React.ReactNode;
  type?: string;
  label: string;
  el?: "label" | "div";
  readOnly?: boolean;
  className?: string;
}): React.ReactElement {
  const El = el ?? "div";
  return (
    <TooltipProvider>
      <El className={`flex flex-col gap-1.5 ${className ?? ""}`}>
        <div className="flex items-center gap-1">
          {labelIcon && (
            <span className="text-muted-foreground">{labelIcon}</span>
          )}
          <Label className="text-xs font-medium text-muted-foreground">
            {label}
          </Label>
          {label && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3 w-3 text-muted-foreground/60 cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="right">{label}</TooltipContent>
            </Tooltip>
          )}
          {readOnly && (
            <span className="ml-auto text-xs text-muted-foreground/50">
              Read only
            </span>
          )}
        </div>
        {children}
      </El>
    </TooltipProvider>
  );
}
