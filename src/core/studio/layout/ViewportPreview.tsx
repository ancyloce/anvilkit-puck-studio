import { Puck } from "@puckeditor/core";
import { getCanvasViewportWidth } from "@/core/overrides/canvas/viewports";
import { useCanvasViewport } from "@/store/hooks";
import type { ReactElement } from "react";
import { ToolBar } from "./ToolBar";

export function ViewportPreview(): ReactElement {
  const canvasViewport = useCanvasViewport();

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden  bg-neutral-100/70 dark:bg-neutral-950/90">
      <ToolBar />
      <div className="min-h-0 flex-1 overflow-hidden px-3 py-2">
        <div
          className="mx-auto h-full duration-200 ease-out rounded-md overflow-hidden"
          style={{ width: getCanvasViewportWidth(canvasViewport) }}
        >
          <Puck.Preview />
        </div>
      </div>
    </div>
  );
}
