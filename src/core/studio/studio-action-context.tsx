import * as React from "react";
import type { StudioHeaderAction } from "./types";

const StudioActionContext = React.createContext<
  ((action: StudioHeaderAction) => void) | undefined
>(undefined);

export function StudioActionProvider({
  children,
  onHeaderAction,
}: {
  children: React.ReactNode;
  onHeaderAction?: (action: StudioHeaderAction) => void;
}) {
  return (
    <StudioActionContext.Provider value={onHeaderAction}>
      {children}
    </StudioActionContext.Provider>
  );
}

export function useStudioActionHandler() {
  return React.useContext(StudioActionContext);
}
