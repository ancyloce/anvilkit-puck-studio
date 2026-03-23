import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useThemeSync } from "@/features/theme/useThemeSync";

// ─── module mock ──────────────────────────────────────────────────────────────

// Expose a setter so individual tests can control the theme value returned
let currentTheme: "light" | "dark" = "light";

vi.mock("@/store/editor-ui", () => ({
  useTheme: () => currentTheme,
}));

// ─── helpers ──────────────────────────────────────────────────────────────────

const CANVAS_STYLE_ID = "__anvilkit_styles__";

function makeDocument(): Document {
  return document.implementation.createHTMLDocument("test");
}

// ─── .dark class toggling on host document ────────────────────────────────────

describe("useThemeSync — .dark class on host document", () => {
  beforeEach(() => {
    currentTheme = "light";
    document.documentElement.classList.remove("dark");
  });

  afterEach(() => {
    document.documentElement.classList.remove("dark");
  });

  it("does not add .dark when theme is light", () => {
    renderHook(() => useThemeSync());
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("adds .dark when theme is dark", () => {
    currentTheme = "dark";
    renderHook(() => useThemeSync());
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("removes .dark when theme switches from dark to light", () => {
    currentTheme = "dark";
    const { rerender } = renderHook(() => useThemeSync());
    expect(document.documentElement.classList.contains("dark")).toBe(true);

    act(() => {
      currentTheme = "light";
    });
    rerender();

    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("adds .dark when theme switches from light to dark", () => {
    currentTheme = "light";
    const { rerender } = renderHook(() => useThemeSync());
    expect(document.documentElement.classList.contains("dark")).toBe(false);

    act(() => {
      currentTheme = "dark";
    });
    rerender();

    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });
});

// ─── .dark class on custom document ──────────────────────────────────────────

describe("useThemeSync — .dark class on custom document", () => {
  beforeEach(() => {
    currentTheme = "light";
  });

  it("applies .dark to the provided document, not the global one", () => {
    currentTheme = "dark";
    const customDoc = makeDocument();
    renderHook(() => useThemeSync({ document: customDoc }));

    expect(customDoc.documentElement.classList.contains("dark")).toBe(true);
    // Global document should not be touched
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("removes .dark from the provided document when theme is light", () => {
    currentTheme = "light";
    const customDoc = makeDocument();
    customDoc.documentElement.classList.add("dark");
    renderHook(() => useThemeSync({ document: customDoc }));

    expect(customDoc.documentElement.classList.contains("dark")).toBe(false);
  });
});

// ─── canvas CSS injection ─────────────────────────────────────────────────────

describe("useThemeSync — canvas CSS injection", () => {
  beforeEach(() => {
    currentTheme = "light";
  });

  it("does not inject a <style> tag when injectCanvasCss is false (default)", () => {
    const customDoc = makeDocument();
    renderHook(() => useThemeSync({ document: customDoc }));
    expect(customDoc.getElementById(CANVAS_STYLE_ID)).toBeNull();
  });

  it("injects a <style> tag with id __anvilkit_styles__ when injectCanvasCss is true", () => {
    const customDoc = makeDocument();
    renderHook(() => useThemeSync({ document: customDoc, injectCanvasCss: true }));
    const style = customDoc.getElementById(CANVAS_STYLE_ID);
    expect(style).not.toBeNull();
    expect(style?.tagName.toLowerCase()).toBe("style");
  });

  it("injected CSS contains :root and .dark variable blocks", () => {
    const customDoc = makeDocument();
    renderHook(() => useThemeSync({ document: customDoc, injectCanvasCss: true }));
    const style = customDoc.getElementById(CANVAS_STYLE_ID);
    expect(style?.textContent).toMatch(/:root/);
    expect(style?.textContent).toMatch(/\.dark/);
  });

  it("replaces existing injected style instead of duplicating it", () => {
    const customDoc = makeDocument();
    const { rerender } = renderHook(() =>
      useThemeSync({ document: customDoc, injectCanvasCss: true }),
    );

    rerender();

    const styles = customDoc.querySelectorAll(`#${CANVAS_STYLE_ID}`);
    expect(styles).toHaveLength(1);
  });

  it("does not inject when document is provided but injectCanvasCss is false", () => {
    const customDoc = makeDocument();
    renderHook(() =>
      useThemeSync({ document: customDoc, injectCanvasCss: false }),
    );
    expect(customDoc.getElementById(CANVAS_STYLE_ID)).toBeNull();
  });
});
