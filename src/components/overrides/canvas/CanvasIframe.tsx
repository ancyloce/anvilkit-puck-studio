"use client";
import * as React from "react";
import { useGetPuck } from "@puckeditor/core";
import { useTheme } from "@/store/hooks";
import {
  LIBRARY_DRAG_START,
  IMAGE_DROP,
  TEXT_DROP,
} from "@/features/library-dnd/drop-contract";
import type {
  LibraryDragType,
  LibraryDragStartDetail,
  ImageDropDetail,
  TextDropDetail,
} from "@/features/library-dnd/drop-contract";
import { replaceImageInProps, replaceTextInProps } from "@/features/library-dnd/replace-props";

// iframe override — Puck signature: { children: ReactNode; document?: Document }
// CRITICAL: inject CSS into the document prop Puck passes directly
const CANVAS_CSS = `
  *, *::before, *::after { box-sizing: border-box; }
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --border: 214.3 31.8% 91.4%;
    --radius: 0.5rem;
  }
  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --border: 217.2 32.6% 17.5%;
  }
  body { margin: 0; font-family: system-ui, sans-serif; }
`;

export function CanvasIframe({
  children,
  document: iframeDoc,
}: {
  children: React.ReactNode;
  document?: Document;
}): React.ReactElement {
  const getPuck = useGetPuck();
  const theme = useTheme();

  // Inject base styles once per iframeDoc instance
  React.useEffect(() => {
    if (!iframeDoc) return;
    const existing = iframeDoc.getElementById("__anvilkit_styles__");
    if (existing) existing.remove();
    const style = iframeDoc.createElement("style");
    style.id = "__anvilkit_styles__";
    style.textContent = CANVAS_CSS;
    iframeDoc.head.appendChild(style);
  }, [iframeDoc]);

  // Sync theme class into iframe document
  React.useEffect(() => {
    if (!iframeDoc) return;
    iframeDoc.documentElement.classList.toggle("dark", theme === "dark");
  }, [iframeDoc, theme]);

  // Library drop bridge
  React.useEffect(() => {
    if (!iframeDoc) return;
    const iframeEl = iframeDoc.defaultView?.frameElement as HTMLIFrameElement | null;
    if (!iframeEl) return;

    let highlightedEl: HTMLElement | null = null;
    let activeLibrary: LibraryDragType | null = null;

    function iframeCoords(clientX: number, clientY: number): { x: number; y: number } | null {
      const rect = iframeEl!.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return null;
      return { x, y };
    }

    function getComponentElAt(clientX: number, clientY: number): HTMLElement | null {
      const coords = iframeCoords(clientX, clientY);
      if (!coords) return null;
      const el = iframeDoc!.elementFromPoint(coords.x, coords.y);
      if (!el) return null;
      return el.closest("[data-puck-component]") as HTMLElement | null;
    }

    function getImgInComponent(compEl: HTMLElement, clientX: number, clientY: number): HTMLImageElement | null {
      const imgs = Array.from(compEl.querySelectorAll("img"));
      if (!imgs.length) return null;
      if (imgs.length === 1) return imgs[0] as HTMLImageElement;
      const rect = iframeEl!.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      let closest: HTMLImageElement | null = null;
      let minDist = Infinity;
      for (const img of imgs) {
        const r = img.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dist = Math.hypot(cx - x, cy - y);
        if (dist < minDist) { minDist = dist; closest = img as HTMLImageElement; }
      }
      return closest;
    }

    const TEXT_TAGS = new Set(["P", "H1", "H2", "H3", "H4", "H5", "H6", "SPAN", "A", "LI", "BUTTON", "LABEL"]);

    function getTextElInComponent(compEl: HTMLElement, clientX: number, clientY: number): HTMLElement | null {
      const coords = iframeCoords(clientX, clientY);
      if (!coords) return null;
      const el = iframeDoc!.elementFromPoint(coords.x, coords.y);
      if (el && compEl.contains(el)) {
        let cur: Element | null = el;
        while (cur && cur !== iframeDoc!.body) {
          if (TEXT_TAGS.has(cur.tagName) && cur.textContent?.trim()) return cur as HTMLElement;
          cur = cur.parentElement;
        }
      }
      for (const tag of TEXT_TAGS) {
        const found = compEl.querySelector(tag.toLowerCase());
        if (found?.textContent?.trim()) return found as HTMLElement;
      }
      return null;
    }

    function setHighlight(el: HTMLElement | null, color: string) {
      if (highlightedEl && highlightedEl !== el) {
        highlightedEl.style.outline = "";
        highlightedEl.style.outlineOffset = "";
      }
      if (el) {
        el.style.outline = `2px solid ${color}`;
        el.style.outlineOffset = "2px";
      }
      highlightedEl = el;
    }

    function clearHighlight() { setHighlight(null, ""); }

    function dispatchReplace(componentId: string, updatedProps: Record<string, unknown>): boolean {
      const { dispatch, getItemById, getSelectorForId } = getPuck();
      const item = getItemById(componentId);
      const selector = getSelectorForId(componentId);
      if (!item || !selector) return false;
      dispatch({
        type: "replace",
        destinationIndex: selector.index,
        destinationZone: selector.zone,
        data: { ...item, props: { ...item.props, ...updatedProps } as typeof item.props },
      });
      return true;
    }

    function onLibraryDragStart(e: Event) {
      activeLibrary = (e as CustomEvent<LibraryDragStartDetail>).detail.type;
    }

    function onPointerMove(e: PointerEvent) {
      if (!activeLibrary) return;
      const compEl = getComponentElAt(e.clientX, e.clientY);
      if (!compEl) { clearHighlight(); return; }
      if (activeLibrary === "image") {
        setHighlight(getImgInComponent(compEl, e.clientX, e.clientY), "#6366f1");
      } else {
        setHighlight(getTextElInComponent(compEl, e.clientX, e.clientY), "#f59e0b");
      }
    }

    function onPointerUp() {
      activeLibrary = null;
      clearHighlight();
    }

    function onImageDrop(e: Event) {
      const { src, clientX, clientY } = (e as CustomEvent<ImageDropDetail>).detail;
      clearHighlight();
      activeLibrary = null;
      if (!src) return;
      const compEl = getComponentElAt(clientX, clientY);
      if (!compEl) return;
      const componentId = compEl.getAttribute("data-puck-component")!;
      const item = getPuck().getItemById(componentId);
      if (!item) return;
      const updatedProps = replaceImageInProps(item.props as Record<string, unknown>, src);
      dispatchReplace(componentId, updatedProps);
    }

    function onTextDrop(e: Event) {
      const { text, clientX, clientY } = (e as CustomEvent<TextDropDetail>).detail;
      clearHighlight();
      activeLibrary = null;
      if (!text) return;
      const compEl = getComponentElAt(clientX, clientY);
      if (!compEl) return;
      const componentId = compEl.getAttribute("data-puck-component")!;
      const textEl = getTextElInComponent(compEl, clientX, clientY);
      const targetText = textEl?.textContent?.trim() ?? "";
      const item = getPuck().getItemById(componentId);
      if (!item) return;
      const { result: updatedProps, replaced } = replaceTextInProps(
        item.props as Record<string, unknown>, text, targetText,
      );
      if (replaced) dispatchReplace(componentId, updatedProps);
    }

    window.addEventListener(LIBRARY_DRAG_START, onLibraryDragStart);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener(IMAGE_DROP, onImageDrop);
    window.addEventListener(TEXT_DROP, onTextDrop);

    return () => {
      window.removeEventListener(LIBRARY_DRAG_START, onLibraryDragStart);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener(IMAGE_DROP, onImageDrop);
      window.removeEventListener(TEXT_DROP, onTextDrop);
    };
  }, [iframeDoc, getPuck]);

  return <>{children}</>;
}
