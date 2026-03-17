"use client";
import * as React from "react";
import { Input } from "@/components/ui/input";
import { FieldLabel } from "../FieldWrapper";

interface NumberFieldProps {
  value: number;
  onChange: (value: number) => void;
  readOnly?: boolean;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
}

// number field — 200ms debounce
export function NumberField({ value, onChange, readOnly, min, max, step, label }: NumberFieldProps) {
  const [local, setLocal] = React.useState(String(value ?? ""));

  React.useEffect(() => {
    setLocal(String(value ?? ""));
  }, [value]);

  React.useEffect(() => {
    const parsed = parseFloat(local);
    if (!isNaN(parsed) && parsed !== value) {
      const timer = setTimeout(() => onChange(parsed), 200);
      return () => clearTimeout(timer);
    }
  }, [local]);

  return (
    <FieldLabel label={label ?? ""} readOnly={readOnly}>
      <Input
        type="number"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        readOnly={readOnly}
        min={min}
        max={max}
        step={step}
        className="h-8 text-sm"
      />
    </FieldLabel>
  );
}
