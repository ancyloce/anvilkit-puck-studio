"use client";
import * as React from "react";
import { usePuck } from "@puckeditor/core";
import type { ComponentData, Overrides } from "@puckeditor/core";
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
type FieldWrapperProps = Parameters<NonNullable<Overrides["fields"]>>[0];
type BaseFieldLabelProps = Parameters<NonNullable<Overrides["fieldLabel"]>>[0];
type FieldLabelProps = Omit<BaseFieldLabelProps, "icon"> & {
  icon?: React.ReactNode;
  labelIcon?: React.ReactNode;
};

function getComponentTypeLabel(item: ComponentData | null | undefined): string {
  if (!item) return "Component";
  return typeof item.type === "string" ? item.type : String(item.type);
}

function getComponentId(item: ComponentData | null | undefined): string | null {
  const id = item?.props?.id;
  return typeof id === "string" ? id : null;
}

function useBreadcrumbs(): BreadcrumbSegment[] {
  const { appState, dispatch, selectedItem, getParentById } = usePuck();
  const { itemSelector } = appState.ui;

  const selectRoot = () =>
    dispatch({ type: "setUi", ui: { itemSelector: null } });

  if (!itemSelector || !selectedItem) {
    return [{ label: "Page" }];
  }

  const selectedType = getComponentTypeLabel(selectedItem);
  const parentId = getComponentId(selectedItem);
  const parent = parentId ? getParentById(parentId) : undefined;

  if (!parent) {
    // Top-level component
    return [{ label: "Page", onSelect: selectRoot }, { label: selectedType }];
  }

  // Nested component — show parent type as intermediate crumb when available
  const parentType = getComponentTypeLabel(parent);
  return [
    { label: "Page", onSelect: selectRoot },
    { label: parentType },
    { label: selectedType },
  ];
}

// fields override — exact Puck signature: { children, isLoading, itemSelector }
export function FieldWrapper({
  children,
}: FieldWrapperProps): React.ReactElement {
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
  icon,
  labelIcon,
  el,
  readOnly,
  className,
}: FieldLabelProps): React.ReactElement {
  const El = el ?? "div";
  const labelAdornment = icon ?? labelIcon;
  return (
    <TooltipProvider>
      <El className={`flex flex-col gap-1.5 ${className ?? ""}`}>
        <div className="flex items-center gap-1">
          {labelAdornment && (
            <span className="text-muted-foreground">{labelAdornment}</span>
          )}
          <Label className="text-xs font-medium text-muted-foreground">
            {label}
          </Label>
          {label && (
            <Tooltip>
              <TooltipTrigger
                aria-label={label}
                render={
                  <button
                    type="button"
                    className="inline-flex cursor-help items-center justify-center text-muted-foreground/60 transition-colors hover:text-muted-foreground"
                  />
                }
              >
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
