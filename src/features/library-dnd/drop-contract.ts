/**
 * Typed event contract for the library drag-drop protocol.
 * All event names and payload shapes are defined here — no magic strings elsewhere.
 */

// ─── Event name constants ────────────────────────────────────────────────────

export const LIBRARY_DRAG_START = "anvilkit:librarydragstart" as const;
export const IMAGE_DROP = "anvilkit:imagedrop" as const;
export const TEXT_DROP = "anvilkit:textdrop" as const;

export type LibraryDragType = "image" | "text";

// ─── Payload types ───────────────────────────────────────────────────────────

export interface LibraryDragStartDetail {
  type: LibraryDragType;
}

export interface ImageDropDetail {
  src: string;
  clientX: number;
  clientY: number;
}

export interface TextDropDetail {
  text: string;
  clientX: number;
  clientY: number;
}

export interface LibraryDragEventMap {
  [LIBRARY_DRAG_START]: LibraryDragStartDetail;
  [IMAGE_DROP]: ImageDropDetail;
  [TEXT_DROP]: TextDropDetail;
}

export type LibraryDragEventName = keyof LibraryDragEventMap;

export type LibraryDragEvent<TName extends LibraryDragEventName> =
  CustomEvent<LibraryDragEventMap[TName]>;

function createLibraryDragEvent<TName extends LibraryDragEventName>(
  type: TName,
  detail: LibraryDragEventMap[TName],
): LibraryDragEvent<TName> {
  return new CustomEvent(type, { detail });
}

export function addLibraryDragEventListener<TName extends LibraryDragEventName>(
  type: TName,
  listener: (event: LibraryDragEvent<TName>) => void,
  target: Window = window,
): () => void {
  const wrapped: EventListener = (event) => {
    listener(event as LibraryDragEvent<TName>);
  };

  target.addEventListener(type, wrapped);

  return () => {
    target.removeEventListener(type, wrapped);
  };
}

// ─── Typed dispatch helpers ──────────────────────────────────────────────────

export function dispatchLibraryDragStart(type: LibraryDragType): void {
  window.dispatchEvent(createLibraryDragEvent(LIBRARY_DRAG_START, { type }));
}

export function dispatchImageDrop(detail: ImageDropDetail): void {
  window.dispatchEvent(createLibraryDragEvent(IMAGE_DROP, detail));
}

export function dispatchTextDrop(detail: TextDropDetail): void {
  window.dispatchEvent(createLibraryDragEvent(TEXT_DROP, detail));
}
