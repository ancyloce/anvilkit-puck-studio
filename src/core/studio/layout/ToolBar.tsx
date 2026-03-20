import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/components/ui/utils";
import { useReportStudioAction } from "@/hooks/use-report-studio-action";
import {
  areCanvasZoomLevelsEqual,
  formatCanvasZoomLabel,
  getCanvasZoomOptions,
} from "@/lib/canvas/zoom";
import { usePuckSelector } from "@/lib/use-puck-selector";
import {
  canvasViewportOrder,
  canvasViewportPresets,
} from "@/lib/canvas/viewports";
import {
  useCanvasAutoZoom,
  useCanvasViewport,
  useCanvasZoom,
  useSetCanvasViewport,
  useSetCanvasZoom,
} from "@/store/editor-ui";
import { useMsg } from "@/store/editor-i18n";
import { Redo2, Undo2, ZoomIn, ZoomOut } from "lucide-react";
import * as React from "react";

export function ToolBar(): React.ReactElement {
  const history = usePuckSelector((state) => state.history);
  const canvasViewport = useCanvasViewport();
  const canvasAutoZoom = useCanvasAutoZoom();
  const canvasZoom = useCanvasZoom();
  const setCanvasViewport = useSetCanvasViewport();
  const setCanvasZoom = useSetCanvasZoom();
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
  const zoomOut = useMsg("canvas.zoom.out");
  const zoomOutTooltip = useMsg("canvas.zoom.out.tooltip");
  const zoomIn = useMsg("canvas.zoom.in");
  const zoomInTooltip = useMsg("canvas.zoom.in.tooltip");
  const autoZoomLabel = useMsg("canvas.zoom.auto");

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

  const zoomOptions = React.useMemo(
    () =>
      getCanvasZoomOptions(canvasAutoZoom).map((option) => ({
        ...option,
        label: option.isAuto ? `${option.label} (${autoZoomLabel})` : option.label,
      })),
    [autoZoomLabel, canvasAutoZoom],
  );

  const activeZoomIndex = React.useMemo(
    () =>
      zoomOptions.findIndex((option) => areCanvasZoomLevelsEqual(option.value, canvasZoom)),
    [canvasZoom, zoomOptions],
  );

  const selectedZoomLabel = React.useMemo(() => {
    const selectedOption = zoomOptions.find((option) =>
      areCanvasZoomLevelsEqual(option.value, canvasZoom),
    );

    return selectedOption?.label ?? formatCanvasZoomLabel(canvasZoom);
  }, [canvasZoom, zoomOptions]);

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

  const handleZoomOut = React.useCallback(() => {
    if (activeZoomIndex <= 0) return;
    setCanvasZoom(zoomOptions[activeZoomIndex - 1].value);
  }, [activeZoomIndex, setCanvasZoom, zoomOptions]);

  const handleZoomIn = React.useCallback(() => {
    if (activeZoomIndex < 0 || activeZoomIndex >= zoomOptions.length - 1) return;
    setCanvasZoom(zoomOptions[activeZoomIndex + 1].value);
  }, [activeZoomIndex, setCanvasZoom, zoomOptions]);

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
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    disabled={activeZoomIndex <= 0}
                    onMouseDown={handleToolbarMouseDown}
                    onClick={handleZoomOut}
                    aria-label={zoomOut}
                  />
                }
              >
                <ZoomOut className="h-4 w-4" />
              </TooltipTrigger>
              <TooltipContent>{zoomOutTooltip}</TooltipContent>
            </Tooltip>

            <Select
              value={canvasZoom.toString()}
              onValueChange={(value) => {
                if (value === null) return;
                setCanvasZoom(Number.parseFloat(value));
              }}
            >
              <SelectTrigger
                className="h-8 min-w-24 justify-center bg-background px-2 text-xs dark:bg-input/30"
                size="sm"
              >
                <span className="flex flex-1 items-center justify-center truncate">
                  {selectedZoomLabel}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {zoomOptions.map((option) => (
                    <SelectItem key={option.label} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    disabled={activeZoomIndex < 0 || activeZoomIndex >= zoomOptions.length - 1}
                    onMouseDown={handleToolbarMouseDown}
                    onClick={handleZoomIn}
                    aria-label={zoomIn}
                  />
                }
              >
                <ZoomIn className="h-4 w-4" />
              </TooltipTrigger>
              <TooltipContent>{zoomInTooltip}</TooltipContent>
            </Tooltip>
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
