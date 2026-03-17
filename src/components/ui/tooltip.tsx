"use client"

import * as React from "react"
import { Tooltip as TooltipPrimitive } from "@base-ui/react"

import { cn } from "@/components/ui/utils"

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

// @base-ui/react Trigger renders its child natively — asChild is not needed
// but we accept it to avoid breaking call sites
function TooltipTrigger({ asChild: _asChild, ...props }: React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Trigger> & { asChild?: boolean }) {
  void _asChild
  return <TooltipPrimitive.Trigger {...props} />
}

type TooltipContentProps = React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Popup> & {
  side?: "top" | "bottom" | "left" | "right"
  sideOffset?: number
}

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Popup>,
  TooltipContentProps
>(({ className, side = "top", sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Positioner side={side} sideOffset={sideOffset}>
      <TooltipPrimitive.Popup
        ref={ref}
        className={cn(
          "z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[ending-style]:animate-out data-[ending-style]:fade-out-0 data-[ending-style]:zoom-out-95",
          className
        )}
        {...props}
      />
    </TooltipPrimitive.Positioner>
  </TooltipPrimitive.Portal>
))
TooltipContent.displayName = "TooltipContent"

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
