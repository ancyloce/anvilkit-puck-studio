"use client";
import * as React from "react";

// componentOverlay override
// Puck signature: { children, hover, isSelected, componentId, componentType }
// MUST be pointer-events-none
export function ComponentOverlay({
  children,
  hover,
  isSelected,
}: {
  children: React.ReactNode;
  hover: boolean;
  isSelected: boolean;
  componentId: string;
  componentType: string;
}): React.ReactElement {
  return (
    <div
      className={[
        "absolute inset-0 rounded-sm pointer-events-none z-10 transition-colors",
        isSelected ? "border-2 border-primary/80" : hover ? "border-2 border-primary/40" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
