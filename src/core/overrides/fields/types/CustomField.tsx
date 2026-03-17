"use client";
import * as React from "react";
import { FieldLabel } from "../FieldWrapper";

interface CustomFieldProps {
  children?: React.ReactNode;
  label?: string;
}

// custom field — freeform wrapper; passes through Puck's custom render
export function CustomField({ children, label }: CustomFieldProps) {
  return (
    <FieldLabel label={label ?? ""} el="div">
      <div className="rounded-md border border-border/60 p-3">
        {children}
      </div>
    </FieldLabel>
  );
}
