"use client";
import * as React from "react";
import { useGetPuck } from "@puckeditor/core";

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
  body { margin: 0; font-family: system-ui, sans-serif; }
`;

function isImageUrl(val: string): boolean {
  return /\.(jpg|jpeg|png|gif|webp|svg|avif)(\?.*)?$/i.test(val) ||
    val.includes("picsum.photos") ||
    val.includes("unsplash.com") ||
    val.includes("images.") ||
    val.startsWith("data:image/");
}

function replaceImageInProps(props: Record<string, any>, newSrc: string): Record<string, any> {
  const result: Record<string, any> = {};
  for (const key of Object.keys(props)) {
    const val = props[key];
    if (typeof val === "string" && isImageUrl(val)) {
      result[key] = newSrc;
    } else if (Array.isArray(val)) {
      result[key] = val.map((item) =>
        item && typeof item === "object" ? replaceImageInProps(item, newSrc) : item
      );
    } else if (val && typeof val === "object") {
      result[key] = replaceImageInProps(val, newSrc);
    } else {
      result[key] = val;
    }
  }
  return result;
}

function replaceTextInProps(
  props: Record<string, any>,
  newText: string,
  targetText: string
): { result: Record<string, any>; replaced: boolean } {
  // First pass: exact match
  for (const key of Object.keys(props)) {
    if (key === "id") continue;
    const val = props[key];
    if (typeof val === "string" && val === targetText && !isImageUrl(val)) {
      return { result: { ...props, [key]: newText }, replaced: true };
    }
  }
  // Second pass: first non-URL string prop
  for (const key of Object.keys(props)) {
    if (key === "id") continue;
    const val = props[key];
    if (typeof val === "string" && !isImageUrl(val) && val.length > 0) {
      return { result: { ...props, [key]: newText }, replaced: true };
    }
  }
  return { result: props, replaced: false };
}

export function CanvasIframe({
  children,
  document: iframeDoc,
}: {
  children: React.ReactNode;
  document?: Document;
}): React.ReactElement {
  const getPuck = useGetPuck();

  React.useEffect(() => {
    if (!iframeDoc) return;
    const existing = iframeDoc.getElementById("__anvilkit_styles__");
    if (existing) existing.remove();
    const style = iframeDoc.createElement("style");
    style.id = "__anvilkit_styles__";
    style.textContent = CANVAS_CSS;
    iframeDoc.head.appendChild(style);
  }, [iframeDoc]);

  React.useEffect(() => {
    if (!iframeDoc) return;
    const iframeEl = iframeDoc.defaultView?.frameElement as HTMLIFrameElement | null;
    if (!iframeEl) return;

    // Highlighted elements inside the iframe doc (styled directly since we have doc access)
    let highlightedEl: HTMLElement | null = null;

    function iframeCoords(clientX: number, clientY: number): { x: number; y: number } | null {
      const rect = iframeEl!.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return null;
      return { x, y };
    }

    // Get the component element ([data-puck-component]) at given parent-window coords.
    // elementFromPoint passes through pointer-events:none overlays to the content below.
    function getComponentElAt(clientX: number, clientY: number): HTMLElement | null {
      const coords = iframeCoords(clientX, clientY);
      if (!coords) return null;
      const el = iframeDoc!.elementFromPoint(coords.x, coords.y);
      if (!el) return null;
      // Walk up to find [data-puck-component]
      const comp = el.closest("[data-puck-component]");
      return comp as HTMLElement | null;
    }

    // For image drops: find an <img> inside the component closest to the drop point
    function getImgInComponent(compEl: HTMLElement, clientX: number, clientY: number): HTMLImageElement | null {
      const imgs = Array.from(compEl.querySelectorAll("img"));
      if (!imgs.length) return null;
      if (imgs.length === 1) return imgs[0] as HTMLImageElement;
      // Pick closest img to drop coords
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

    // For text drops: find the text element closest to drop point
    const TEXT_TAGS = new Set(["P", "H1", "H2", "H3", "H4", "H5", "H6", "SPAN", "A", "LI", "BUTTON", "LABEL"]);
    function getTextElInComponent(compEl: HTMLElement, clientX: number, clientY: number): HTMLElement | null {
      const coords = iframeCoords(clientX, clientY);
      if (!coords) return null;
      // Try elementFromPoint first for precision
      const el = iframeDoc!.elementFromPoint(coords.x, coords.y);
      if (el && compEl.contains(el)) {
        let cur: Element | null = el;
        while (cur && cur !== iframeDoc!.body) {
          if (TEXT_TAGS.has(cur.tagName) && cur.textContent?.trim()) return cur as HTMLElement;
          cur = cur.parentElement;
        }
      }
      // Fallback: first text element in component
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

    function clearHighlight() {
      setHighlight(null, "");
    }

    // Track which library is active so we know what to highlight
    let activeLibrary: "image" | "text" | null = null;

    function onLibraryDragStart(e: Event) {
      activeLibrary = (e as CustomEvent).detail.type;
    }

    function onPointerMove(e: PointerEvent) {
      if (!activeLibrary) return;
      const compEl = getComponentElAt(e.clientX, e.clientY);
      if (!compEl) { clearHighlight(); return; }

      if (activeLibrary === "image") {
        const img = getImgInComponent(compEl, e.clientX, e.clientY);
        setHighlight(img, "#6366f1");
      } else {
        const textEl = getTextElInComponent(compEl, e.clientX, e.clientY);
        setHighlight(textEl, "#f59e0b");
      }
    }

    function onPointerUp() {
      activeLibrary = null;
      clearHighlight();
    }

    function dispatchReplace(componentId: string, updatedProps: Record<string, any>) {
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

    function onImageDrop(e: Event) {
      const { src, clientX, clientY } = (e as CustomEvent).detail as {
        src: string; clientX: number; clientY: number;
      };
      clearHighlight();
      activeLibrary = null;
      if (!src) return;

      const compEl = getComponentElAt(clientX, clientY);
      if (!compEl) return;
      const componentId = compEl.getAttribute("data-puck-component")!;

      const { getItemById } = getPuck();
      const item = getItemById(componentId);
      if (!item) return;

      const updatedProps = replaceImageInProps(item.props as Record<string, any>, src);
      dispatchReplace(componentId, updatedProps);
    }

    function onTextDrop(e: Event) {
      const { text, clientX, clientY } = (e as CustomEvent).detail as {
        text: string; clientX: number; clientY: number;
      };
      clearHighlight();
      activeLibrary = null;
      if (!text) return;

      const compEl = getComponentElAt(clientX, clientY);
      if (!compEl) return;
      const componentId = compEl.getAttribute("data-puck-component")!;

      const textEl = getTextElInComponent(compEl, clientX, clientY);
      const targetText = textEl?.textContent?.trim() ?? "";

      const { getItemById } = getPuck();
      const item = getItemById(componentId);
      if (!item) return;

      const { result: updatedProps, replaced } = replaceTextInProps(
        item.props as Record<string, any>, text, targetText
      );
      if (replaced) dispatchReplace(componentId, updatedProps);
    }

    window.addEventListener("anvilkit:librarydragstart", onLibraryDragStart);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("anvilkit:imagedrop", onImageDrop);
    window.addEventListener("anvilkit:textdrop", onTextDrop);

    return () => {
      window.removeEventListener("anvilkit:librarydragstart", onLibraryDragStart);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("anvilkit:imagedrop", onImageDrop);
      window.removeEventListener("anvilkit:textdrop", onTextDrop);
    };
  }, [iframeDoc, getPuck]);

  return <>{children}</>;
}
