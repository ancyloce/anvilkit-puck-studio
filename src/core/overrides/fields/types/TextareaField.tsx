"use client";
import * as React from "react";
import { Textarea } from "@/components/ui/textarea";
import { FieldLabel } from "../FieldWrapper";

interface TextareaFieldProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  placeholder?: string;
  label?: string;
}

// textarea field — 200ms debounce
export function TextareaField({ value, onChange, readOnly, placeholder, label }: TextareaFieldProps) {
  const [local, setLocal] = React.useState(value ?? "");

  React.useEffect(() => {
    setLocal(value ?? "");
  }, [value]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (local !== value) onChange(local);
    }, 200);
    return () => clearTimeout(timer);
  }, [local]);

  return (
    <FieldLabel label={label ?? ""} readOnly={readOnly}>
      <Textarea
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        readOnly={readOnly}
        placeholder={placeholder}
        className="min-h-[80px] text-sm resize-y"
      />
    </FieldLabel>
  );
}
