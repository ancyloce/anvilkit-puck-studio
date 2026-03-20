"use client";
import * as React from "react";
import { useThemeSync } from "@/features/theme/useThemeSync";
import { useLibraryDropBridge } from "./useLibraryDropBridge";

// iframe override — Puck signature: { children: ReactNode; document?: Document }
export function CanvasIframe({
  children,
  document: iframeDoc,
}: {
  children: React.ReactNode;
  document?: Document;
}): React.ReactElement {
  useThemeSync({ document: iframeDoc, injectCanvasCss: true });
  useLibraryDropBridge(iframeDoc);

  return <>{children}</>;
}
