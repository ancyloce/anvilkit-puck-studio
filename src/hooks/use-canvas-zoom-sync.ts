"use client";

import * as React from "react";
import { getCanvasZoomConfig } from "@/lib/canvas/zoom";
import { getCanvasViewportPixelWidth } from "@/lib/canvas/viewports";
import { useCanvasViewport, useEditorUiStoreApi } from "@/store/editor-ui";

export function useCanvasZoomSync<T extends HTMLElement = HTMLDivElement>() {
  const frameRef = React.useRef<T | null>(null);
  const canvasViewport = useCanvasViewport();
  const uiStoreApi = useEditorUiStoreApi();

  React.useLayoutEffect(() => {
    const frameElement = frameRef.current;
    if (!frameElement) return;

    const syncCanvasZoom = () => {
      const store = uiStoreApi.getState();
      const rect = frameElement.getBoundingClientRect();
      const nextZoomConfig = getCanvasZoomConfig({
        viewportWidth: getCanvasViewportPixelWidth(canvasViewport),
        frameWidth: rect.width,
        frameHeight: rect.height,
        zoom: store.canvasZoomConfig.zoom,
      });

      if (
        store.canvasZoomConfig.autoZoom === nextZoomConfig.autoZoom &&
        store.canvasZoomConfig.rootHeight === nextZoomConfig.rootHeight &&
        store.canvasZoomConfig.zoom === nextZoomConfig.zoom
      ) {
        return;
      }

      store.setCanvasZoomConfig(nextZoomConfig);
    };

    syncCanvasZoom();

    const resizeObserver = new ResizeObserver(() => {
      syncCanvasZoom();
    });

    resizeObserver.observe(frameElement);

    return () => {
      resizeObserver.disconnect();
    };
  }, [canvasViewport, uiStoreApi]);

  return frameRef;
}
