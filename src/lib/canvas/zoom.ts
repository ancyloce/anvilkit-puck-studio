export interface CanvasZoomOption {
  label: string;
  value: number;
  isAuto?: boolean;
}

export interface CanvasZoomConfig {
  autoZoom: number;
  rootHeight: number;
  zoom: number;
}

export const DEFAULT_CANVAS_ZOOM_CONFIG: CanvasZoomConfig = {
  autoZoom: 1,
  rootHeight: 0,
  zoom: 1,
};

export const DEFAULT_CANVAS_ZOOM_OPTIONS: CanvasZoomOption[] = [
  { label: "25%", value: 0.25 },
  { label: "50%", value: 0.5 },
  { label: "75%", value: 0.75 },
  { label: "100%", value: 1 },
];

const ZOOM_EPSILON = 0.001;
const RESET_ZOOM_SMALLER_THAN_FRAME = true;

export function normalizeCanvasZoomLevel(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 1;
}

export function normalizeCanvasRootHeight(value: number): number {
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

export function areCanvasZoomLevelsEqual(left: number, right: number): boolean {
  return Math.abs(normalizeCanvasZoomLevel(left) - normalizeCanvasZoomLevel(right)) < ZOOM_EPSILON;
}

export function formatCanvasZoomLabel(zoom: number): string {
  return `${(normalizeCanvasZoomLevel(zoom) * 100).toFixed(0)}%`;
}

export function getCanvasZoomOptions(autoZoom: number): CanvasZoomOption[] {
  const normalizedAutoZoom = normalizeCanvasZoomLevel(autoZoom);
  const defaultsContainAutoZoom = DEFAULT_CANVAS_ZOOM_OPTIONS.some((option) =>
    areCanvasZoomLevelsEqual(option.value, normalizedAutoZoom),
  );

  return [
    ...DEFAULT_CANVAS_ZOOM_OPTIONS,
    ...(defaultsContainAutoZoom
      ? []
      : [
          {
            value: normalizedAutoZoom,
            label: formatCanvasZoomLabel(normalizedAutoZoom),
            isAuto: true,
          },
        ]),
  ].sort((left, right) => left.value - right.value);
}

interface GetCanvasZoomConfigOptions {
  viewportWidth: number;
  viewportHeight?: number | "auto";
  frameWidth: number;
  frameHeight: number;
  zoom: number;
}

export function getCanvasZoomConfig({
  viewportWidth,
  viewportHeight = "auto",
  frameWidth,
  frameHeight,
  zoom,
}: GetCanvasZoomConfigOptions): CanvasZoomConfig {
  const resolvedViewportWidth = Number.isFinite(viewportWidth) && viewportWidth > 0 ? viewportWidth : 1;
  const resolvedFrameWidth = Number.isFinite(frameWidth) && frameWidth >= 0 ? frameWidth : 0;
  const resolvedFrameHeight = Number.isFinite(frameHeight) && frameHeight >= 0 ? frameHeight : 0;
  const resolvedViewportHeight =
    viewportHeight === "auto"
      ? resolvedFrameHeight
      : Number.isFinite(viewportHeight) && viewportHeight >= 0
        ? viewportHeight
        : resolvedFrameHeight;

  let rootHeight = normalizeCanvasRootHeight(resolvedViewportHeight);
  let autoZoom = 1;
  let nextZoom = normalizeCanvasZoomLevel(zoom);

  if (
    resolvedViewportWidth > resolvedFrameWidth ||
    resolvedViewportHeight > resolvedFrameHeight
  ) {
    const widthZoom = Math.min(resolvedFrameWidth / resolvedViewportWidth, 1);
    const heightZoom =
      resolvedViewportHeight > 0 ? Math.min(resolvedFrameHeight / resolvedViewportHeight, 1) : 1;

    nextZoom = normalizeCanvasZoomLevel(widthZoom);

    if (widthZoom < heightZoom) {
      rootHeight = normalizeCanvasRootHeight(resolvedViewportHeight / nextZoom);
    } else {
      rootHeight = normalizeCanvasRootHeight(resolvedViewportHeight);
      nextZoom = normalizeCanvasZoomLevel(heightZoom);
    }

    autoZoom = nextZoom;
  } else if (RESET_ZOOM_SMALLER_THAN_FRAME) {
    autoZoom = 1;
    nextZoom = 1;
    rootHeight = normalizeCanvasRootHeight(resolvedViewportHeight);
  }

  return {
    autoZoom: normalizeCanvasZoomLevel(autoZoom),
    rootHeight: normalizeCanvasRootHeight(rootHeight),
    zoom: normalizeCanvasZoomLevel(nextZoom),
  };
}
