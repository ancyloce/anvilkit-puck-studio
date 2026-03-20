import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/components/ui/utils";
import { useReportStudioAction } from "@/core/studio/useReportStudioAction";
import { usePuckSelector } from "@/lib/use-puck-selector";
import { useCanvasViewport, useMsg, useSetCanvasViewport } from "@/store/hooks";
import { Redo2, Undo2 } from "lucide-react";
import * as React from "react";
import {
  canvasViewportOrder,
  canvasViewportPresets,
} from "@/core/overrides/canvas/viewports";

export function ToolBar(): React.ReactElement {
  const history = usePuckSelector((state) => state.history);
  const canvasViewport = useCanvasViewport();
  const setCanvasViewport = useSetCanvasViewport();
  const reportStudioAction = useReportStudioAction();

  const undo = useMsg("header.undo");
  const undoTooltip = useMsg("header.undo.tooltip");
  const redo = useMsg("header.redo");
  const redoTooltip = useMsg("header.redo.tooltip");
  const mobileLabel = useMsg("canvas.viewport.mobile");
  const mobileTooltip = useMsg("canvas.viewport.mobile.tooltip");
  const tabletLabel = useMsg("canvas.viewport.tablet");
  const tabletTooltip = useMsg("canvas.viewport.tablet.tooltip");
  const desktopLabel = useMsg("canvas.viewport.desktop");
  const desktopTooltip = useMsg("canvas.viewport.desktop.tooltip");

  const viewportLabels = React.useMemo(
    () => ({
      mobile: { label: mobileLabel, tooltip: mobileTooltip },
      tablet: { label: tabletLabel, tooltip: tabletTooltip },
      desktop: { label: desktopLabel, tooltip: desktopTooltip },
    }),
    [
      desktopLabel,
      desktopTooltip,
      mobileLabel,
      mobileTooltip,
      tabletLabel,
      tabletTooltip,
    ],
  );

  const handleToolbarMouseDown = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
    },
    [],
  );

  const handleUndo = React.useCallback(() => {
    history.back();
    reportStudioAction("undo");
  }, [history, reportStudioAction]);

  const handleRedo = React.useCallback(() => {
    history.forward();
    reportStudioAction("redo");
  }, [history, reportStudioAction]);

  return (
    <TooltipProvider>
      <div className="sticky top-0 z-50 shrink-0">
        <div className="flex items-center justify-between gap-3 px-3 py-2">
          <ButtonGroup>
            {canvasViewportOrder.map((viewport) => {
              const preset = canvasViewportPresets[viewport];
              const { label, tooltip } = viewportLabels[viewport];
              const isActive = viewport === canvasViewport;
              const Icon = preset.icon;

              return (
                <Tooltip key={preset.value}>
                  <TooltipTrigger
                    render={
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        aria-label={label}
                        aria-pressed={isActive}
                        onClick={() => {
                          if (!isActive) {
                            setCanvasViewport(viewport);
                          }
                        }}
                        className={cn(
                          "h-8 gap-1.5 px-2.5 text-xs",
                          isActive &&
                            "bg-muted text-foreground dark:border-input dark:bg-input/50",
                          !isActive && "text-muted-foreground",
                        )}
                      />
                    }
                  >
                    <Icon className="h-4 w-4" />
                  </TooltipTrigger>
                  <TooltipContent>{tooltip}</TooltipContent>
                </Tooltip>
              );
            })}
          </ButtonGroup>

          <ButtonGroup>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon-sm"
                    disabled={!history.hasPast}
                    onMouseDown={handleToolbarMouseDown}
                    onClick={handleUndo}
                    aria-label={undo}
                  />
                }
              >
                <Undo2 className="h-4 w-4" />
              </TooltipTrigger>
              <TooltipContent>{undoTooltip}</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon-sm"
                    disabled={!history.hasFuture}
                    onMouseDown={handleToolbarMouseDown}
                    onClick={handleRedo}
                    aria-label={redo}
                  />
                }
              >
                <Redo2 className="h-4 w-4" />
              </TooltipTrigger>
              <TooltipContent>{redoTooltip}</TooltipContent>
            </Tooltip>
          </ButtonGroup>
        </div>
      </div>
    </TooltipProvider>
  );
}
