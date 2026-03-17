"use client";
import * as React from "react";
import { useTheme } from "@/store/hooks";

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

const CANVAS_STYLE_ID = "__anvilkit_styles__";

export interface UseThemeSyncOptions {
  document?: Document;
  injectCanvasCss?: boolean;
}

function resolveDocument(target?: Document): Document | undefined {
  if (target) return target;
  if (typeof document === "undefined") return undefined;
  return document;
}

export function useThemeSync({
  document: targetDocument,
  injectCanvasCss = false,
}: UseThemeSyncOptions = {}): void {
  const theme = useTheme();

  React.useEffect(() => {
    const resolvedDocument = resolveDocument(targetDocument);
    if (!resolvedDocument || !injectCanvasCss) return;

    const existing = resolvedDocument.getElementById(CANVAS_STYLE_ID);
    if (existing) existing.remove();

    const style = resolvedDocument.createElement("style");
    style.id = CANVAS_STYLE_ID;
    style.textContent = CANVAS_CSS;
    resolvedDocument.head.appendChild(style);
  }, [targetDocument, injectCanvasCss]);

  React.useEffect(() => {
    const resolvedDocument = resolveDocument(targetDocument);
    if (!resolvedDocument) return;

    resolvedDocument.documentElement.classList.toggle("dark", theme === "dark");
  }, [targetDocument, theme]);
}
