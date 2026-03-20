"use client";
import * as React from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
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

type ImagePage = {
  items: ImageItem[];
  hasMore?: boolean;
};

type ImagePageResult = ImageItem[] | ImagePage;

type ImagePageLoader = (
  query: string,
  page: number,
  pageSize: number,
) => Promise<ImagePageResult> | ImagePageResult;

export interface ImagesProps {
  /** Override the default picsum seed list */
  seeds?: string[];
  /** Provide a fully custom image list (bypasses seeds entirely) */
  items?: ImageItem[];
  /** Optional paged image source for infinite scrolling */
  loadPage?: ImagePageLoader;
  /** Number of items requested per page when using loadPage */
  pageSize?: number;
}

const GRID_COLUMNS = 2;
const DEFAULT_PAGE_SIZE = 24;
const LOAD_MORE_THRESHOLD_ROWS = 3;
const IMAGE_ROW_HEIGHT = 114;

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

function getSearchImages(query: string, start: number, count: number): ImageItem[] {
  return Array.from({ length: count }, (_, i) => {
    const index = start + i;
    return {
      src: picsumUrl(`${query}-${index}`),
      alt: `${query} ${index + 1}`,
      id: `${query}-${index}`,
    };
  });
}

function getLocalPage(
  seeds: string[],
  query: string,
  page: number,
  pageSize: number,
): Required<ImagePage> {
  const start = page * pageSize;
  if (query) {
    return {
      items: getSearchImages(query, start, pageSize),
      hasMore: true,
    };
  }

  const defaultImages = getDefaultImages(seeds);
  const items = defaultImages.slice(start, start + pageSize);
  return {
    items,
    hasMore: start + pageSize < defaultImages.length,
  };
}

function normalizePageResult(
  result: ImagePageResult,
  pageSize: number,
): Required<ImagePage> {
  if (Array.isArray(result)) {
    return {
      items: result,
      hasMore: result.length >= pageSize,
    };
  }

  return {
    items: result.items,
    hasMore: result.hasMore ?? result.items.length >= pageSize,
  };
}

function getItemAt(items: ImageItem[], rowIndex: number, columnIndex: number): ImageItem | null {
  return items[rowIndex * GRID_COLUMNS + columnIndex] ?? null;
}

function ImageLibraryCard({
  item,
  startDrag,
}: {
  item: ImageItem;
  startDrag: ReturnType<typeof useGhostDrag>["startDrag"];
}): React.ReactElement {
  return (
    <div
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
  );
}

function LoadingRow(): React.ReactElement {
  return (
    <div className="p-2">
      <div className="h-5 rounded bg-muted/40 animate-pulse" />
    </div>
  );
}

function ErrorRow({ message }: { message: string }): React.ReactElement {
  return (
    <div className="px-2 pb-2 text-xs text-destructive">
      {message}
    </div>
  );
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
  loadPage,
  pageSize,
}: ImagesProps = {}): React.ReactElement {
  const effectiveSeeds = seeds ?? DEFAULT_SEEDS;
  const resolvedPageSize = typeof pageSize === "number" && pageSize > 0
    ? Math.floor(pageSize)
    : DEFAULT_PAGE_SIZE;
  const hasCustomImages = customImages !== undefined;
  const hasPagedLoader = loadPage !== undefined;
  const initialLocalPage = !hasCustomImages && !hasPagedLoader
    ? getLocalPage(effectiveSeeds, "", 0, resolvedPageSize)
    : null;

  const [query, setQuery] = React.useState("");
  const [committed, setCommitted] = React.useState("");
  const [pagedItems, setPagedItems] = React.useState<ImageItem[]>(
    () => initialLocalPage?.items ?? [],
  );
  const [hasMore, setHasMore] = React.useState(
    () => initialLocalPage?.hasMore ?? hasPagedLoader,
  );
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const viewportRef = React.useRef<HTMLDivElement | null>(null);
  const requestIdRef = React.useRef(0);
  const pageRef = React.useRef(initialLocalPage ? 0 : -1);
  const hasMoreRef = React.useRef(initialLocalPage?.hasMore ?? hasPagedLoader);
  const isLoadingRef = React.useRef(false);
  const didInitializeRef = React.useRef(false);
  const loadPageRef = React.useRef(loadPage);

  const items = customImages ?? pagedItems;
  const rowCount = Math.ceil(items.length / GRID_COLUMNS);
  const libraryTitle = useMsg("image-library.title");
  const searchPlaceholder = useMsg("image-library.search.placeholder");

  const { startDrag } = useGhostDrag({
    createGhostEl: createImageGhost,
  });
  const rowVirtualizer = useVirtualizer<HTMLDivElement, HTMLDivElement>({
    count: rowCount,
    getScrollElement: () => viewportRef.current,
    estimateSize: () => IMAGE_ROW_HEIGHT,
    overscan: 4,
  });
  const virtualRows = rowVirtualizer.getVirtualItems();

  React.useEffect(() => {
    const t = setTimeout(() => setCommitted(query.trim()), 400);
    return () => clearTimeout(t);
  }, [query]);

  React.useEffect(() => {
    loadPageRef.current = loadPage;
  }, [loadPage]);

  const fetchPage = React.useCallback(
    async (nextQuery: string, page: number): Promise<Required<ImagePage>> => {
      const result = loadPageRef.current
        ? await loadPageRef.current(nextQuery, page, resolvedPageSize)
        : getLocalPage(effectiveSeeds, nextQuery, page, resolvedPageSize);

      return normalizePageResult(result, resolvedPageSize);
    },
    [effectiveSeeds, resolvedPageSize],
  );

  const loadRequestedPage = React.useCallback(
    async (nextQuery: string, page: number, replace = false) => {
      if (!replace && (isLoadingRef.current || !hasMoreRef.current)) return;

      const requestId = requestIdRef.current;
      isLoadingRef.current = true;
      setIsLoading(true);

      try {
        const result = await fetchPage(nextQuery, page);
        if (requestId !== requestIdRef.current) return;

        setPagedItems((current) => (replace ? result.items : [...current, ...result.items]));
        pageRef.current = page;
        hasMoreRef.current = result.hasMore;
        setHasMore(result.hasMore);
        setError(null);
      } catch (cause) {
        if (requestId !== requestIdRef.current) return;

        const message = cause instanceof Error
          ? cause.message
          : "Unable to load images.";

        console.error("Failed to load image library page", cause);
        hasMoreRef.current = false;
        setHasMore(false);
        setError(message);
      } finally {
        if (requestId === requestIdRef.current) {
          isLoadingRef.current = false;
          setIsLoading(false);
        }
      }
    },
    [fetchPage],
  );

  React.useEffect(() => {
    const shouldSkipInitialLocalLoad =
      !didInitializeRef.current &&
      !hasCustomImages &&
      !hasPagedLoader &&
      committed === "";

    didInitializeRef.current = true;

    if (hasCustomImages) {
      requestIdRef.current += 1;
      isLoadingRef.current = false;
      hasMoreRef.current = false;
      pageRef.current = -1;
      setHasMore(false);
      setIsLoading(false);
      setError(null);
      return;
    }

    if (shouldSkipInitialLocalLoad) {
      return;
    }

    requestIdRef.current += 1;
    isLoadingRef.current = false;
    hasMoreRef.current = true;
    pageRef.current = -1;
    setPagedItems([]);
    setHasMore(true);
    setIsLoading(false);
    setError(null);
    viewportRef.current?.scrollTo({ top: 0 });
    void loadRequestedPage(committed, 0, true);
  }, [committed, hasCustomImages, hasPagedLoader, loadRequestedPage]);

  React.useEffect(() => {
    if (hasCustomImages || isLoading || !hasMore || rowCount === 0) return;

    const lastVirtualRow = virtualRows[virtualRows.length - 1];
    if (!lastVirtualRow) return;
    if (lastVirtualRow.index < rowCount - LOAD_MORE_THRESHOLD_ROWS) return;

    void loadRequestedPage(committed, pageRef.current + 1);
  }, [
    committed,
    hasCustomImages,
    hasMore,
    isLoading,
    loadRequestedPage,
    rowCount,
    virtualRows,
  ]);

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
      <ScrollArea className="flex-1" viewportRef={viewportRef}>
        <div className="p-2" aria-busy={isLoading}>
          <div
            className="relative"
            style={{ height: rowVirtualizer.getTotalSize() }}
          >
            {virtualRows.map((virtualRow) => {
              const firstItem = getItemAt(items, virtualRow.index, 0);
              const secondItem = getItemAt(items, virtualRow.index, 1);

              return (
                <div
                  key={virtualRow.key}
                  data-index={virtualRow.index}
                  ref={rowVirtualizer.measureElement}
                  className="absolute inset-x-0 grid grid-cols-2 gap-2 pb-2"
                  style={{ transform: `translateY(${virtualRow.start}px)` }}
                >
                  {firstItem && (
                    <ImageLibraryCard item={firstItem} startDrag={startDrag} />
                  )}
                  {secondItem && (
                    <ImageLibraryCard item={secondItem} startDrag={startDrag} />
                  )}
                </div>
              );
            })}
          </div>
          {isLoading && items.length === 0 && <LoadingRow />}
          {error && <ErrorRow message={error} />}
        </div>
      </ScrollArea>
    </div>
  );
}
