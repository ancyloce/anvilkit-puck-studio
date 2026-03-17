"use client";
import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FieldLabel } from "../FieldWrapper";

interface SlotFieldProps {
  children?: React.ReactNode;
  label?: string;
}

// slot field — guidance card; slot content is managed on the canvas
export function SlotField({ children, label }: SlotFieldProps) {
  return (
    <FieldLabel label={label ?? ""} el="div">
      <Card className="border-dashed">
        <CardContent className="py-3 px-3">
          {children ?? (
            <p className="text-xs text-muted-foreground text-center">
              Slot content is managed directly on the canvas.
            </p>
          )}
        </CardContent>
      </Card>
    </FieldLabel>
  );
}
