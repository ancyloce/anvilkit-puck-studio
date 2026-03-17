"use client";
import * as React from "react";
import { dispatchLibraryDragStart, dispatchImageDrop, dispatchTextDrop } from "./drop-contract";
import type { LibraryDragType } from "./drop-contract";

interface GhostOptions {
  /** Called to build the ghost DOM element for the given payload */
  createGhostEl: (payload: string) => HTMLDivElement;
}

interface UseGhostDragResult {
  /** Attach to onPointerDown of a draggable item */
  startDrag: (
    e: React.PointerEvent<HTMLElement>,
    type: LibraryDragType,
    payload: string,
  ) => void;
}

/**
 * Shared pointer-based ghost drag hook used by ImageLibrary and CopyLibrary.
 * Handles ghost lifecycle, pointermove/pointerup listeners, and event dispatch.
 */
export function useGhostDrag({ createGhostEl }: GhostOptions): UseGhostDragResult {
  // Module-scoped ref so ghost survives across renders without causing re-renders
  const ghostRef = React.useRef<HTMLDivElement | null>(null);

  function moveGhost(x: number, y: number) {
    if (!ghostRef.current) return;
    ghostRef.current.style.left = `${x + 12}px`;
    ghostRef.current.style.top = `${y + 12}px`;
  }

  function removeGhost() {
    ghostRef.current?.remove();
    ghostRef.current = null;
  }

  const startDrag = React.useCallback(
    (
      e: React.PointerEvent<HTMLElement>,
      type: LibraryDragType,
      payload: string,
    ) => {
      e.stopPropagation();
      e.currentTarget.setPointerCapture(e.pointerId);

      ghostRef.current = createGhostEl(payload);
      moveGhost(e.clientX, e.clientY);
      dispatchLibraryDragStart(type);

      function onMove(ev: PointerEvent) {
        moveGhost(ev.clientX, ev.clientY);
      }

      function onUp(ev: PointerEvent) {
        removeGhost();
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);

        if (type === "image") {
          dispatchImageDrop({ src: payload, clientX: ev.clientX, clientY: ev.clientY });
        } else {
          dispatchTextDrop({ text: payload, clientX: ev.clientX, clientY: ev.clientY });
        }
      }

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [createGhostEl],
  );

  return { startDrag };
}
