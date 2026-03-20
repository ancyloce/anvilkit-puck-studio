"use client";

import * as React from "react";
import { usePuckSelector } from "@/lib/use-puck-selector";
import { useStudioActionHandler } from "./studio-action-context";
import type { StudioHeaderAction } from "./types";

export function useReportStudioAction() {
  const onHeaderAction = useStudioActionHandler();
  const puckData = usePuckSelector((state) => state.appState.data);

  return React.useCallback(
    (type: StudioHeaderAction["type"]) => {
      onHeaderAction?.({ type, data: puckData });
    },
    [onHeaderAction, puckData],
  );
}
