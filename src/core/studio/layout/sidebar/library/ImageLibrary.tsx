"use client";
import * as React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMsg } from "@/store/hooks";
import { useGhostDrag } from "@/features/library-dnd/useGhostDrag";

export interface ImageItem {
  id: string;
  src: string;
  alt: string;
}

export interface ImagesProps {
  /** Override the default picsum seed list */
  seeds?: string[];
  /** Provide a fully custom image list (bypasses seeds entirely) */
  items?: ImageItem[];
}

const DEFAULT_SEEDS = [
  "forest", "ocean", "mountain", "city",
  "food", "travel", "abstract", "people",
  "architecture", "animals", "technology", "minimal",
];

function picsumUrl(seed: string, w = 960, h = 960): string {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;
}

function getDefaultImages(seeds: string[]): ImageItem[] {
  return seeds.map((seed, i) => ({
    src: picsumUrl(seed),
    alt: seed,
    id: `${seed}-${i}`,
  }));
}

function getSearchImages(query: string): ImageItem[] {
  return Array.from({ length: 12 }, (_, i) => ({
    src: picsumUrl(`${query}-${i}`),
    alt: `${query} ${i + 1}`,
    id: `${query}-${i}`,
  }));
}

function createImageGhost(src: string): HTMLDivElement {
  const el = document.createElement("div");
  el.style.cssText = `
    position: fixed; top: -9999px; left: -9999px; z-index: 99999;
    width: 80px; height: 60px; border-radius: 6px; overflow: hidden;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3); pointer-events: none;
  `;
  const img = document.createElement("img");
  img.src = src;
  img.style.cssText = "width:100%;height:100%;object-fit:cover;";
  el.appendChild(img);
  document.body.appendChild(el);
  return el;
}

export function ImageLibrary({
  seeds,
  items: customImages,
}: ImagesProps = {}): React.ReactElement {
  const effectiveSeeds = seeds ?? DEFAULT_SEEDS;
  const [query, setQuery] = React.useState("");
  const [committed, setCommitted] = React.useState("");
  const [items, setItems] = React.useState<ImageItem[]>(
    () => customImages ?? getDefaultImages(effectiveSeeds),
  );
  const libraryTitle = useMsg("image-library.title");
  const searchPlaceholder = useMsg("image-library.search.placeholder");

  const { startDrag } = useGhostDrag({
    createGhostEl: createImageGhost,
  });

  React.useEffect(() => {
    const t = setTimeout(() => setCommitted(query.trim()), 400);
    return () => clearTimeout(t);
  }, [query]);

  React.useEffect(() => {
    if (customImages) return;
    setItems(
      committed ? getSearchImages(committed) : getDefaultImages(effectiveSeeds),
    );
  }, [committed, customImages, effectiveSeeds]);

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
        <div className="p-2 grid grid-cols-2 gap-2">
          {items.map((item) => (
            <div
              key={item.id}
              onPointerDown={(e) => startDrag(e, "image", item.src)}
              className="rounded-md overflow-hidden border border-border bg-muted/40 cursor-grab select-none hover:ring-2 hover:ring-primary/50 active:cursor-grabbing transition-all"
            >
              <img
                src={item.src}
                alt={item.alt}
                className="w-full h-20 object-cover pointer-events-none"
                loading="lazy"
              />
              <div className="px-1.5 py-1 text-xs text-muted-foreground truncate capitalize">
                {item.alt}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
