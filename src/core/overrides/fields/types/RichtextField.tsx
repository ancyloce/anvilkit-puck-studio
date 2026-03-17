"use client";
import * as React from "react";
import { Toggle } from "@/components/ui/toggle";
import { Bold, Italic, Link } from "lucide-react";
import { FieldLabel } from "../FieldWrapper";
import { useMsg } from "@/store/hooks";

interface RichtextFieldProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  label?: string;
}

// richtext field — contenteditable with a compact Toggle toolbar
export function RichtextField({ value, onChange, readOnly, label }: RichtextFieldProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const boldLabel = useMsg("richtext.bold");
  const italicLabel = useMsg("richtext.italic");
  const linkLabel = useMsg("richtext.link");
  const linkPrompt = useMsg("richtext.link.prompt");

  React.useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value ?? "";
    }
  }, [value]);

  const exec = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    if (ref.current) onChange(ref.current.innerHTML);
  };

  return (
    <FieldLabel label={label ?? ""} readOnly={readOnly}>
      <div className="flex flex-col gap-1 rounded-md border border-input overflow-hidden">
        {!readOnly && (
          <div className="flex items-center gap-0.5 border-b px-1 py-0.5 bg-muted/30">
            <Toggle size="sm" onPressedChange={() => exec("bold")} aria-label={boldLabel}>
              <Bold className="h-3.5 w-3.5" />
            </Toggle>
            <Toggle size="sm" onPressedChange={() => exec("italic")} aria-label={italicLabel}>
              <Italic className="h-3.5 w-3.5" />
            </Toggle>
            <Toggle
              size="sm"
              onPressedChange={() => {
                const url = window.prompt(linkPrompt);
                if (url) exec("createLink", url);
              }}
              aria-label={linkLabel}
            >
              <Link className="h-3.5 w-3.5" />
            </Toggle>
          </div>
        )}
        <div
          ref={ref}
          contentEditable={!readOnly}
          suppressContentEditableWarning
          onInput={() => { if (ref.current) onChange(ref.current.innerHTML); }}
          className="min-h-[60px] px-3 py-2 text-sm outline-none"
        />
      </div>
    </FieldLabel>
  );
}
