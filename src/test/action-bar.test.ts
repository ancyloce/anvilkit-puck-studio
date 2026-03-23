import { describe, it, expect, beforeEach } from "vitest";
import {
  hasClippingOverflow,
  hasScrollableOverflow,
  intersectRects,
  getClippingAncestors,
  getScrollableAncestors,
  getVisibleBounds,
} from "@/lib/canvas/action-bar";

// ─── helpers ──────────────────────────────────────────────────────────────────

function makeStyle(overflowX: string, overflowY: string): CSSStyleDeclaration {
  return { overflowX, overflowY } as unknown as CSSStyleDeclaration;
}

function makeRect(l: number, t: number, r: number, b: number) {
  return { left: l, top: t, right: r, bottom: b, width: r - l, height: b - t };
}

// ─── hasClippingOverflow ──────────────────────────────────────────────────────

describe("hasClippingOverflow", () => {
  it.each(["auto", "clip", "hidden", "overlay", "scroll"])(
    "returns true when overflowX is %s",
    (val) => {
      expect(hasClippingOverflow(makeStyle(val, "visible"))).toBe(true);
    },
  );

  it.each(["auto", "clip", "hidden", "overlay", "scroll"])(
    "returns true when overflowY is %s",
    (val) => {
      expect(hasClippingOverflow(makeStyle("visible", val))).toBe(true);
    },
  );

  it("returns false when both overflow values are visible", () => {
    expect(hasClippingOverflow(makeStyle("visible", "visible"))).toBe(false);
  });
});

// ─── hasScrollableOverflow ────────────────────────────────────────────────────

describe("hasScrollableOverflow", () => {
  it.each(["auto", "overlay", "scroll"])(
    "returns true when overflowX is %s",
    (val) => {
      expect(hasScrollableOverflow(makeStyle(val, "visible"))).toBe(true);
    },
  );

  it.each(["auto", "overlay", "scroll"])(
    "returns true when overflowY is %s",
    (val) => {
      expect(hasScrollableOverflow(makeStyle("visible", val))).toBe(true);
    },
  );

  it("returns false for clip/hidden", () => {
    expect(hasScrollableOverflow(makeStyle("clip", "hidden"))).toBe(false);
  });

  it("returns false for visible", () => {
    expect(hasScrollableOverflow(makeStyle("visible", "visible"))).toBe(false);
  });
});

// ─── intersectRects ───────────────────────────────────────────────────────────

describe("intersectRects", () => {
  it("returns intersection of two overlapping rects", () => {
    const result = intersectRects(makeRect(0, 0, 100, 100), makeRect(50, 50, 150, 150));
    expect(result).toEqual(makeRect(50, 50, 100, 100));
  });

  it("returns null for non-overlapping rects (left/right)", () => {
    expect(intersectRects(makeRect(0, 0, 50, 100), makeRect(60, 0, 120, 100))).toBeNull();
  });

  it("returns null for non-overlapping rects (top/bottom)", () => {
    expect(intersectRects(makeRect(0, 0, 100, 50), makeRect(0, 60, 100, 120))).toBeNull();
  });

  it("returns null for touching (zero-area intersection)", () => {
    // right edge of A touches left edge of B — nextRight === nextLeft, which fails nextRight <= nextLeft
    expect(intersectRects(makeRect(0, 0, 50, 100), makeRect(50, 0, 100, 100))).toBeNull();
  });

  it("returns the smaller rect when one is contained in the other", () => {
    const result = intersectRects(makeRect(0, 0, 200, 200), makeRect(50, 50, 150, 150));
    expect(result).toEqual(makeRect(50, 50, 150, 150));
  });

  it("computes width and height correctly", () => {
    const result = intersectRects(makeRect(10, 20, 110, 120), makeRect(30, 40, 80, 90));
    expect(result?.width).toBe(50);
    expect(result?.height).toBe(50);
  });
});

// ─── getClippingAncestors ─────────────────────────────────────────────────────

describe("getClippingAncestors", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("returns empty array when no ancestor has clipping overflow", () => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    expect(getClippingAncestors(el)).toEqual([]);
  });

  it("returns ancestor with overflow: hidden", () => {
    const parent = document.createElement("div");
    parent.style.overflowX = "hidden";
    parent.style.overflowY = "hidden";
    const child = document.createElement("div");
    parent.appendChild(child);
    document.body.appendChild(parent);

    const ancestors = getClippingAncestors(child);
    expect(ancestors).toContain(parent);
  });

  it("returns multiple clipping ancestors in DOM order (closest first)", () => {
    const grandparent = document.createElement("div");
    grandparent.style.overflowY = "clip";
    const parent = document.createElement("div");
    parent.style.overflowX = "hidden";
    const child = document.createElement("div");
    parent.appendChild(child);
    grandparent.appendChild(parent);
    document.body.appendChild(grandparent);

    const ancestors = getClippingAncestors(child);
    expect(ancestors[0]).toBe(parent);
    expect(ancestors[1]).toBe(grandparent);
  });
});

// ─── getScrollableAncestors ───────────────────────────────────────────────────

describe("getScrollableAncestors", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("returns empty array when no ancestor has scrollable overflow", () => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    expect(getScrollableAncestors(el)).toEqual([]);
  });

  it("returns ancestor with overflow: auto", () => {
    const parent = document.createElement("div");
    parent.style.overflowY = "auto";
    const child = document.createElement("div");
    parent.appendChild(child);
    document.body.appendChild(parent);

    const ancestors = getScrollableAncestors(child);
    expect(ancestors).toContain(parent);
  });

  it("does not include ancestors with overflow: clip (not scrollable)", () => {
    const parent = document.createElement("div");
    parent.style.overflow = "clip";
    const child = document.createElement("div");
    parent.appendChild(child);
    document.body.appendChild(parent);

    expect(getScrollableAncestors(child)).toEqual([]);
  });
});

// ─── getVisibleBounds ─────────────────────────────────────────────────────────

describe("getVisibleBounds", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("returns viewport bounds when element has no clipping ancestors", () => {
    const el = document.createElement("div");
    document.body.appendChild(el);

    const bounds = getVisibleBounds(el);
    expect(bounds).not.toBeNull();
    expect(bounds?.left).toBe(0);
    expect(bounds?.top).toBe(0);
    // jsdom defaults window.innerWidth/Height to 1024x768
    expect(bounds?.right).toBe(window.innerWidth);
    expect(bounds?.bottom).toBe(window.innerHeight);
  });

  it("clips bounds to a hidden ancestor's bounding rect", () => {
    const parent = document.createElement("div");
    parent.style.overflowX = "hidden";
    parent.style.overflowY = "hidden";
    // Mock getBoundingClientRect on the parent
    parent.getBoundingClientRect = () =>
      ({ left: 100, top: 50, right: 500, bottom: 400, width: 400, height: 350 }) as DOMRect;
    const child = document.createElement("div");
    parent.appendChild(child);
    document.body.appendChild(parent);

    const bounds = getVisibleBounds(child);
    expect(bounds?.left).toBe(100);
    expect(bounds?.top).toBe(50);
    expect(bounds?.right).toBe(500);
    expect(bounds?.bottom).toBe(400);
  });

  it("returns null when clipping ancestor has zero intersection with viewport", () => {
    const parent = document.createElement("div");
    parent.style.overflowX = "hidden";
    parent.style.overflowY = "hidden";
    // Element positioned entirely outside the viewport
    parent.getBoundingClientRect = () =>
      ({ left: 5000, top: 5000, right: 6000, bottom: 6000, width: 1000, height: 1000 }) as DOMRect;
    const child = document.createElement("div");
    parent.appendChild(child);
    document.body.appendChild(parent);

    const bounds = getVisibleBounds(child);
    expect(bounds).toBeNull();
  });
});
