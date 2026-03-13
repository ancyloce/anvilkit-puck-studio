"use client";
import * as React from "react";
import { Input } from "@/components/ui/input";
import { FieldLabel } from "../FieldWrapper";

interface TextFieldProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  placeholder?: string;
  label?: string;
  labelIcon?: React.ReactNode;
}

// text field — 200ms debounce to avoid canvas re-render on every keystroke
export function TextField({
  value,
  onChange,
  readOnly,
  placeholder,
  label,
  labelIcon,
}: TextFieldProps) {
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
    <FieldLabel label={label ?? ""} labelIcon={labelIcon} readOnly={readOnly}>
      <Input
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        readOnly={readOnly}
        placeholder={placeholder}
        className="h-8 text-sm"
      />
    </FieldLabel>
  );
}
