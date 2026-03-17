"use client";
import * as React from "react";
import { useGetPuck } from "@puckeditor/core";
import {
  LIBRARY_DRAG_START,
  IMAGE_DROP,
  TEXT_DROP,
  addLibraryDragEventListener,
} from "@/features/library-dnd/drop-contract";
import type {
  LibraryDragType,
} from "@/features/library-dnd/drop-contract";
import {
  replaceImageInProps,
  replaceTextInProps,
} from "@/features/library-dnd/replace-props";
import {
  getComponentElAt,
  getImageElInComponent,
  getTextElInComponent,
} from "./drop-targets";
import { createElementHighlighter } from "./highlight";

/**
 * Bridges library drag events to Puck prop-replacement dispatches.
 * Handles hit-testing inside the iframe, highlight feedback, and cleanup.
 * All global listeners are deterministically removed on unmount or iframeDoc change.
 */
export function useLibraryDropBridge(iframeDoc: Document | undefined): void {
  const getPuck = useGetPuck();

  React.useEffect(() => {
    if (!iframeDoc) return;
    const iframeEl = iframeDoc.defaultView?.frameElement as HTMLIFrameElement | null;
    if (!iframeEl) return;
    const iframeDocument = iframeDoc;
    const frameElement = iframeEl;

    let activeLibrary: LibraryDragType | null = null;
    const highlighter = createElementHighlighter();

    // ── Puck dispatch ───────────────────────────────────────────────────────

    function dispatchReplace(
      componentId: string,
      updatedProps: Record<string, unknown>,
    ): boolean {
      const { dispatch, getItemById, getSelectorForId } = getPuck();
      const item = getItemById(componentId);
      const selector = getSelectorForId(componentId);
      if (!item || !selector) return false;
      dispatch({
        type: "replace",
        destinationIndex: selector.index,
        destinationZone: selector.zone,
        data: {
          ...item,
          props: { ...item.props, ...updatedProps } as typeof item.props,
        },
      });
      return true;
    }

    // ── Event handlers ──────────────────────────────────────────────────────

    function onLibraryDragStart(type: LibraryDragType): void {
      activeLibrary = type;
    }

    function onPointerMove(e: PointerEvent): void {
      if (!activeLibrary) return;
      const compEl = getComponentElAt(iframeDocument, frameElement, e.clientX, e.clientY);
      if (!compEl) {
        highlighter.clear();
        return;
      }
      if (activeLibrary === "image") {
        highlighter.set(
          getImageElInComponent(compEl, frameElement, e.clientX, e.clientY),
          "#6366f1",
        );
      } else {
        highlighter.set(
          getTextElInComponent(iframeDocument, frameElement, compEl, e.clientX, e.clientY),
          "#f59e0b",
        );
      }
    }

    function onPointerUp(): void {
      activeLibrary = null;
      highlighter.clear();
    }

    function onImageDrop(src: string, clientX: number, clientY: number): void {
      highlighter.clear();
      activeLibrary = null;
      if (!src) return;
      const compEl = getComponentElAt(iframeDocument, frameElement, clientX, clientY);
      if (!compEl) return;
      const componentId = compEl.dataset.puckComponent;
      if (!componentId) return;
      const item = getPuck().getItemById(componentId);
      if (!item) return;
      const updatedProps = replaceImageInProps(
        item.props as Record<string, unknown>,
        src,
      );
      dispatchReplace(componentId, updatedProps);
    }

    function onTextDrop(text: string, clientX: number, clientY: number): void {
      highlighter.clear();
      activeLibrary = null;
      if (!text) return;
      const compEl = getComponentElAt(iframeDocument, frameElement, clientX, clientY);
      if (!compEl) return;
      const componentId = compEl.dataset.puckComponent;
      if (!componentId) return;
      const textEl = getTextElInComponent(
        iframeDocument,
        frameElement,
        compEl,
        clientX,
        clientY,
      );
      const targetText = textEl?.textContent?.trim() ?? "";
      const item = getPuck().getItemById(componentId);
      if (!item) return;
      const { result: updatedProps, replaced } = replaceTextInProps(
        item.props as Record<string, unknown>,
        text,
        targetText,
      );
      if (replaced) dispatchReplace(componentId, updatedProps);
    }

    // ── Register / cleanup ──────────────────────────────────────────────────

    const removeLibraryDragStart = addLibraryDragEventListener(
      LIBRARY_DRAG_START,
      (event) => {
        onLibraryDragStart(event.detail.type);
      },
    );
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    const removeImageDrop = addLibraryDragEventListener(IMAGE_DROP, (event) => {
      const { src, clientX, clientY } = event.detail;
      onImageDrop(src, clientX, clientY);
    });
    const removeTextDrop = addLibraryDragEventListener(TEXT_DROP, (event) => {
      const { text, clientX, clientY } = event.detail;
      onTextDrop(text, clientX, clientY);
    });

    return () => {
      removeLibraryDragStart();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      removeImageDrop();
      removeTextDrop();
      highlighter.clear();
    };
  }, [iframeDoc, getPuck]);
}
