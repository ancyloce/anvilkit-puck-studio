"use client";
import * as React from "react";
import { FieldLabel } from "../FieldWrapper";

interface ObjectFieldProps {
  field: { type: "object"; objectFields: Record<string, unknown> };
  value: Record<string, unknown>;
  onChange: (value: Record<string, unknown>) => void;
  id?: string;
  readOnly?: boolean;
  name: string;
  children?: React.ReactNode;
}

// object field — nested grouped container with left-edge decoration
// Puck renders objectFields as children via AutoField; we just provide the container
export function ObjectField({ children, name, readOnly }: ObjectFieldProps) {
  return (
    <FieldLabel label={name} el="div" readOnly={readOnly}>
      <div className="flex flex-col gap-3 pl-3 border-l-2 border-border/60 ml-1">
        {children}
      </div>
    </FieldLabel>
  );
}
