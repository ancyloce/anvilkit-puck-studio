"use client";
import * as React from "react";
import { ButtonGroup } from "@/components/ui/button-group";
import { Button } from "@/components/ui/button";
import { FieldLabel } from "../FieldWrapper";

interface RadioOption {
  label: string;
  value: string | number | boolean;
}

interface RadioFieldProps {
  field: { type: "radio"; options: RadioOption[] };
  value: string | number | boolean;
  onChange: (value: string | number | boolean) => void;
  id?: string;
  readOnly?: boolean;
  label?: string;
}

export function RadioField({ field, value, onChange, readOnly, label }: RadioFieldProps) {
  const options = field.options ?? [];

  return (
    <FieldLabel label={label ?? ""} readOnly={readOnly} el="div">
      <ButtonGroup className="w-full">
        {options.map((opt) => {
          const selected = String(opt.value) === String(value ?? "");
          return (
            <Button
              key={String(opt.value)}
              type="button"
              variant={selected ? "default" : "outline"}
              size="sm"
              className="flex-1 text-xs"
              disabled={readOnly}
              onClick={() => onChange(opt.value)}
            >
              {opt.label}
            </Button>
          );
        })}
      </ButtonGroup>
    </FieldLabel>
  );
}
