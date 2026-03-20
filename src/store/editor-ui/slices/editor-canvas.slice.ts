import {
  DEFAULT_CANVAS_ZOOM_CONFIG,
  type CanvasZoomConfig,
  normalizeCanvasRootHeight,
  normalizeCanvasZoomLevel,
} from "@/lib/canvas/zoom";
import type { LibraryDragType } from "@/features/library-dnd/drop-contract";
import type { EditorUiSliceCreator } from "../editor-ui.types";

export const EDITOR_CANVAS_VIEWPORTS = ["mobile", "tablet", "desktop"] as const;

export type EditorCanvasViewport = (typeof EDITOR_CANVAS_VIEWPORTS)[number];
export type CanvasViewport = EditorCanvasViewport;

const editorCanvasViewportSet = new Set<string>(EDITOR_CANVAS_VIEWPORTS);

export function isEditorCanvasViewport(value: string): value is EditorCanvasViewport {
  return editorCanvasViewportSet.has(value);
}

export const CANVAS_VIEWPORTS = EDITOR_CANVAS_VIEWPORTS;

export function isCanvasViewport(value: string): value is CanvasViewport {
  return isEditorCanvasViewport(value);
}

export interface EditorCanvasSlice {
  canvasViewport: EditorCanvasViewport;
  setCanvasViewport: (viewport: EditorCanvasViewport) => void;
  canvasZoomConfig: CanvasZoomConfig;
  setCanvasZoomConfig: (zoomConfig: CanvasZoomConfig) => void;
  setCanvasZoom: (zoom: number) => void;
  canvasLibraryDragType: LibraryDragType | null;
  setCanvasLibraryDragType: (type: LibraryDragType | null) => void;
}

export const createEditorCanvasSlice: EditorUiSliceCreator<EditorCanvasSlice> = (set) => ({
  canvasViewport: "desktop",
  setCanvasViewport: (canvasViewport) => set({ canvasViewport }),
  canvasZoomConfig: DEFAULT_CANVAS_ZOOM_CONFIG,
  setCanvasZoomConfig: (canvasZoomConfig) =>
    set({
      canvasZoomConfig: {
        autoZoom: normalizeCanvasZoomLevel(canvasZoomConfig.autoZoom),
        rootHeight: normalizeCanvasRootHeight(canvasZoomConfig.rootHeight),
        zoom: normalizeCanvasZoomLevel(canvasZoomConfig.zoom),
      },
    }),
  setCanvasZoom: (zoom) =>
    set((state) => ({
      canvasZoomConfig: {
        ...state.canvasZoomConfig,
        zoom: normalizeCanvasZoomLevel(zoom),
      },
    })),
  canvasLibraryDragType: null,
  setCanvasLibraryDragType: (canvasLibraryDragType) => set({ canvasLibraryDragType }),
});
