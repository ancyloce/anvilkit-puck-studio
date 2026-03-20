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

export function areCanvasZoomLevelsEqual(left: number, right: number): boolean {
  return Math.abs(left - right) < ZOOM_EPSILON;
}

export function formatCanvasZoomLabel(zoom: number): string {
  return `${(zoom * 100).toFixed(0)}%`;
}

export function getCanvasZoomOptions(autoZoom: number): CanvasZoomOption[] {
  const defaultsContainAutoZoom = DEFAULT_CANVAS_ZOOM_OPTIONS.some((option) =>
    areCanvasZoomLevelsEqual(option.value, autoZoom),
  );

  return [
    ...DEFAULT_CANVAS_ZOOM_OPTIONS,
    ...(defaultsContainAutoZoom
      ? []
      : [{ value: autoZoom, label: formatCanvasZoomLabel(autoZoom), isAuto: true }]),
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
  const resolvedViewportHeight = viewportHeight === "auto" ? frameHeight : viewportHeight;

  let rootHeight = resolvedViewportHeight;
  let autoZoom = 1;
  let nextZoom = zoom;

  if (viewportWidth > frameWidth || resolvedViewportHeight > frameHeight) {
    const widthZoom = Math.min(frameWidth / viewportWidth, 1);
    const heightZoom = Math.min(frameHeight / resolvedViewportHeight, 1);

    nextZoom = widthZoom;

    if (widthZoom < heightZoom) {
      rootHeight = resolvedViewportHeight / nextZoom;
    } else {
      rootHeight = resolvedViewportHeight;
      nextZoom = heightZoom;
    }

    autoZoom = nextZoom;
  } else if (RESET_ZOOM_SMALLER_THAN_FRAME) {
    autoZoom = 1;
    nextZoom = 1;
    rootHeight = resolvedViewportHeight;
  }

  return {
    autoZoom,
    rootHeight,
    zoom: nextZoom,
  };
}
