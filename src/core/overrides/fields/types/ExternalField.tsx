"use client";
import * as React from "react";
import { Command, CommandInput, CommandList, CommandEmpty, CommandItem } from "@/components/ui/command";
import { Skeleton } from "@/components/ui/skeleton";
import { FieldLabel } from "../FieldWrapper";

interface ExternalFieldProps {
  value: unknown;
  onChange: (value: unknown) => void;
  fetchList?: (query: string) => Promise<{ label: string; value: unknown }[]>;
  readOnly?: boolean;
  label?: string;
}

// external field — Command palette with Skeleton loading state
export function ExternalField({ value, onChange, fetchList, readOnly, label }: ExternalFieldProps) {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<{ label: string; value: unknown }[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!fetchList) return;
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const data = await fetchList(query);
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, fetchList]);

  const selectedLabel = results.find((r) => r.value === value)?.label ?? String(value ?? "");

  return (
    <FieldLabel label={label ?? ""} readOnly={readOnly}>
      <Command className="rounded-md border border-input">
        <CommandInput
          placeholder="Search..."
          value={query}
          onValueChange={setQuery}
          disabled={readOnly}
        />
        <CommandList>
          {loading ? (
            <div className="flex flex-col gap-1.5 p-2">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
            </div>
          ) : results.length === 0 ? (
            <CommandEmpty>No results found.</CommandEmpty>
          ) : (
            results.map((r, i) => (
              <CommandItem
                key={i}
                data-checked={r.value === value}
                onSelect={() => onChange(r.value)}
              >
                {r.label}
              </CommandItem>
            ))
          )}
        </CommandList>
        {value != null && (
          <div className="border-t px-3 py-1.5 text-xs text-muted-foreground truncate">
            Selected: <span className="font-medium text-foreground">{selectedLabel}</span>
          </div>
        )}
      </Command>
    </FieldLabel>
  );
}
