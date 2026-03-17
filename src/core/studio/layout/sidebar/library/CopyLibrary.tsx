"use client";
import * as React from "react";
import { Search, Type } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMsg } from "@/store/hooks";
import { useGhostDrag } from "@/features/library-dnd/useGhostDrag";

export interface CopywritingItem {
  label: string;
  text: string;
  category: string;
}

export interface CopywritingProps {
  items?: CopywritingItem[];
}

const DEFAULT_SNIPPETS: CopywritingItem[] = [
  { category: "Headlines", label: "Bold statement", text: "The Future Starts Here" },
  { category: "Headlines", label: "Question hook", text: "Ready to Transform Your Business?" },
  { category: "Headlines", label: "Value prop", text: "Simple, Powerful, Built for Teams" },
  { category: "Headlines", label: "Action-led", text: "Ship Faster. Break Less. Sleep Better." },
  { category: "Subheadings", label: "Feature intro", text: "Everything you need, nothing you don't." },
  { category: "Subheadings", label: "Social proof", text: "Trusted by over 10,000 teams worldwide." },
  { category: "Subheadings", label: "CTA support", text: "Get started in minutes — no credit card required." },
  { category: "Body", label: "Product description", text: "Our platform helps teams collaborate in real time, ship products faster, and stay aligned across every stage of the process." },
  { category: "Body", label: "Feature benefit", text: "With built-in analytics and smart automation, you can focus on what matters most — building great products." },
  { category: "Body", label: "About us", text: "We're a small team on a big mission: to make software development feel effortless for everyone." },
  { category: "CTAs", label: "Primary", text: "Get Started Free" },
  { category: "CTAs", label: "Secondary", text: "Learn More" },
  { category: "CTAs", label: "Soft sell", text: "See How It Works" },
  { category: "CTAs", label: "Urgency", text: "Start Your Free Trial Today" },
];

function createTextGhost(text: string): HTMLDivElement {
  const el = document.createElement("div");
  el.style.cssText = `
    position: fixed; top: -9999px; left: -9999px; z-index: 99999;
    max-width: 200px; padding: 6px 10px; border-radius: 6px;
    background: #1e1e2e; color: #fff; font-size: 12px; line-height: 1.4;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3); pointer-events: none;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  `;
  el.textContent = text.length > 40 ? text.slice(0, 40) + "…" : text;
  document.body.appendChild(el);
  return el;
}

export function CopyLibrary({ items }: CopywritingProps = {}): React.ReactElement {
  const activeSnippets = items ?? DEFAULT_SNIPPETS;
  const categories = Array.from(new Set(activeSnippets.map((s) => s.category)));
  const [query, setQuery] = React.useState("");
  const libraryTitle = useMsg("copy-library.title");
  const searchPlaceholder = useMsg("copy-library.search.placeholder");

  const { startDrag } = useGhostDrag({ createGhostEl: createTextGhost });

  const filtered = query.trim()
    ? activeSnippets.filter(
        (s) =>
          s.text.toLowerCase().includes(query.toLowerCase()) ||
          s.label.toLowerCase().includes(query.toLowerCase()) ||
          s.category.toLowerCase().includes(query.toLowerCase()),
      )
    : activeSnippets;

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 pt-3 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {libraryTitle}
      </div>
      <div className="p-2">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder={searchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 flex flex-col gap-4">
          {(query.trim() ? [null] : categories).map((cat) => {
            const snippets = cat
              ? filtered.filter((s) => s.category === cat)
              : filtered;
            if (!snippets.length) return null;
            return (
              <div key={cat ?? "results"}>
                {cat && (
                  <div className="px-1 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <Type className="h-3 w-3" />
                    {cat}
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  {snippets.map((snippet) => (
                    <div
                      key={`${snippet.category}-${snippet.label}`}
                      onPointerDown={(e) => startDrag(e, "text", snippet.text)}
                      className="rounded-md border border-border bg-muted/40 px-2.5 py-2 cursor-grab select-none hover:bg-muted hover:ring-1 hover:ring-primary/40 active:cursor-grabbing transition-all"
                    >
                      <div className="text-xs font-medium text-foreground/70 mb-0.5">
                        {snippet.label}
                      </div>
                      <div className="text-xs text-foreground leading-snug line-clamp-2">
                        {snippet.text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
