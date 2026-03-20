import { Monitor, Smartphone, Tablet } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { EditorCanvasViewport } from "@/store/editor-ui";

interface CanvasViewportPreset {
  icon: LucideIcon;
  labelKey: string;
  tooltipKey: string;
  value: EditorCanvasViewport;
  width: number;
}

export const canvasViewportOrder: EditorCanvasViewport[] = [
  "mobile",
  "tablet",
  "desktop",
];

export const canvasViewportPresets: Record<EditorCanvasViewport, CanvasViewportPreset> = {
  mobile: {
    icon: Smartphone,
    labelKey: "canvas.viewport.mobile",
    tooltipKey: "canvas.viewport.mobile.tooltip",
    value: "mobile",
    width: 390,
  },
  tablet: {
    icon: Tablet,
    labelKey: "canvas.viewport.tablet",
    tooltipKey: "canvas.viewport.tablet.tooltip",
    value: "tablet",
    width: 768,
  },
  desktop: {
    icon: Monitor,
    labelKey: "canvas.viewport.desktop",
    tooltipKey: "canvas.viewport.desktop.tooltip",
    value: "desktop",
    width: 1280,
  },
};

export function getCanvasViewportPixelWidth(
  viewport: EditorCanvasViewport | string | null | undefined,
): number {
  return canvasViewportPresets[viewport as EditorCanvasViewport]?.width ??
    canvasViewportPresets.desktop.width;
}

export function getCanvasViewportWidth(
  viewport: EditorCanvasViewport | string | null | undefined,
): string {
  return `${getCanvasViewportPixelWidth(viewport)}px`;
}
