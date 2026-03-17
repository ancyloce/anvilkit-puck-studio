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

// ─── Typed dispatch helpers ──────────────────────────────────────────────────

export function dispatchLibraryDragStart(type: LibraryDragType): void {
  window.dispatchEvent(
    new CustomEvent<LibraryDragStartDetail>(LIBRARY_DRAG_START, {
      detail: { type },
    }),
  );
}

export function dispatchImageDrop(detail: ImageDropDetail): void {
  window.dispatchEvent(new CustomEvent<ImageDropDetail>(IMAGE_DROP, { detail }));
}

export function dispatchTextDrop(detail: TextDropDetail): void {
  window.dispatchEvent(new CustomEvent<TextDropDetail>(TEXT_DROP, { detail }));
}
