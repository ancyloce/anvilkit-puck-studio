import { Puck } from "@puckeditor/core";
import {
  getCanvasViewportPixelWidth,
  getCanvasViewportWidth,
} from "@/lib/canvas/viewports";
import { useCanvasZoomSync } from "@/hooks/use-canvas-zoom-sync";
import { useCanvasRootHeight, useCanvasViewport, useCanvasZoom } from "@/store/editor-ui";
import type { ReactElement } from "react";
import { ToolBar } from "./ToolBar";

export function ViewportPreview(): ReactElement {
  const frameRef = useCanvasZoomSync<HTMLDivElement>();
  const canvasViewport = useCanvasViewport();
  const canvasRootHeight = useCanvasRootHeight();
  const canvasZoom = useCanvasZoom();
  const viewportWidth = getCanvasViewportPixelWidth(canvasViewport);
  const scaledViewportHeight = canvasRootHeight > 0 ? canvasRootHeight * canvasZoom : undefined;
  const scaledViewportWidth = viewportWidth * canvasZoom;

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden  bg-neutral-100/70 dark:bg-neutral-950/90">
      <ToolBar />
      <div className="min-h-0 flex-1 overflow-hidden px-3 py-2">
        <div ref={frameRef} className="h-full w-full overflow-auto">
          <div className="flex min-h-full min-w-full items-start justify-center">
            <div
              className="relative duration-200 ease-out"
              style={{
                width: scaledViewportWidth,
                height: scaledViewportHeight,
              }}
            >
              <div
                className="absolute top-0 left-0 overflow-hidden rounded-md shadow-sm duration-200 ease-out"
                style={{
                  width: getCanvasViewportWidth(canvasViewport),
                  height: canvasRootHeight > 0 ? canvasRootHeight : "100%",
                  transform: `scale(${canvasZoom})`,
                  transformOrigin: "top left",
                }}
              >
                <Puck.Preview />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
