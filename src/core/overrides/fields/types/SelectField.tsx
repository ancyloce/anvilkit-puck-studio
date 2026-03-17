"use client";
import * as React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FieldLabel } from "../FieldWrapper";

interface SelectOption {
  label: string;
  value: string | number | boolean;
}

interface SelectFieldProps {
  field: { type: "select"; options: SelectOption[] };
  value: string | number | boolean;
  onChange: (value: string | number | boolean) => void;
  id?: string;
  readOnly?: boolean;
  label?: string;
}

// select field — immediate onChange; options sourced from field.options per Puck AutoField API
export function SelectField({ field, value, onChange, id, readOnly, label }: SelectFieldProps) {
  return (
    <FieldLabel label={label ?? ""} readOnly={readOnly}>
      <Select
        value={String(value ?? "")}
        onValueChange={(v) => {
          if (v === null) return;
          // coerce back to original type based on field.options
          const match = field.options.find((o) => String(o.value) === v);
          onChange(match ? match.value : v);
        }}
      >
        <SelectTrigger id={id} className="h-8 text-sm w-full" disabled={readOnly}>
          <SelectValue placeholder="Select..." />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {field.options.map((opt) => (
              <SelectItem key={String(opt.value)} value={String(opt.value)}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </FieldLabel>
  );
}
