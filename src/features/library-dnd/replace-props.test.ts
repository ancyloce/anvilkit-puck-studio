import { describe, it, expect } from "vitest";
import {
  isImageUrl,
  replaceImageInProps,
  replaceTextInProps,
} from "./replace-props";

// ─── isImageUrl ───────────────────────────────────────────────────────────────

describe("isImageUrl", () => {
  it.each([
    "https://example.com/photo.jpg",
    "https://example.com/photo.jpeg",
    "https://example.com/photo.png",
    "https://example.com/photo.gif",
    "https://example.com/photo.webp",
    "https://example.com/photo.svg",
    "https://example.com/photo.avif",
    "https://example.com/photo.jpg?v=123",
  ])("returns true for extension-based URL: %s", (url) => {
    expect(isImageUrl(url)).toBe(true);
  });

  it.each([
    "https://picsum.photos/seed/forest/960/960",
    "https://images.unsplash.com/photo-123",
    "https://images.example.com/banner",
    "data:image/png;base64,abc123",
  ])("returns true for known image host/prefix: %s", (url) => {
    expect(isImageUrl(url)).toBe(true);
  });

  it.each([
    "Hello world",
    "https://example.com/page",
    "https://example.com/document.pdf",
    "",
    "just a label",
  ])("returns false for non-image string: %s", (val) => {
    expect(isImageUrl(val)).toBe(false);
  });
});

// ─── replaceImageInProps ──────────────────────────────────────────────────────

describe("replaceImageInProps", () => {
  it("replaces a top-level image URL prop", () => {
    const result = replaceImageInProps(
      { src: "https://picsum.photos/seed/a/960/960", title: "hello" },
      "/new.jpg",
    );
    expect(result.src).toBe("/new.jpg");
    expect(result.title).toBe("hello");
  });

  it("leaves non-image string props untouched", () => {
    const result = replaceImageInProps({ label: "Click me" }, "/new.jpg");
    expect(result.label).toBe("Click me");
  });

  it("replaces image URLs nested in an object", () => {
    const result = replaceImageInProps(
      { media: { src: "https://picsum.photos/seed/b/960/960", alt: "desc" } },
      "/new.jpg",
    );
    expect((result.media as Record<string, unknown>).src).toBe("/new.jpg");
    expect((result.media as Record<string, unknown>).alt).toBe("desc");
  });

  it("replaces image URLs inside an array of objects", () => {
    const result = replaceImageInProps(
      {
        slides: [
          { src: "https://picsum.photos/seed/c/960/960", caption: "one" },
          { src: "https://picsum.photos/seed/d/960/960", caption: "two" },
        ],
      },
      "/new.jpg",
    );
    const slides = result.slides as Array<Record<string, unknown>>;
    expect(slides[0].src).toBe("/new.jpg");
    expect(slides[1].src).toBe("/new.jpg");
    expect(slides[0].caption).toBe("one");
  });

  it("passes through primitive array items unchanged", () => {
    const result = replaceImageInProps({ tags: ["a", "b"] }, "/new.jpg");
    expect(result.tags).toEqual(["a", "b"]);
  });

  it("replaces multiple image props at the same level", () => {
    const result = replaceImageInProps(
      {
        hero: "https://picsum.photos/seed/e/960/960",
        thumb: "https://picsum.photos/seed/f/960/960",
      },
      "/new.jpg",
    );
    expect(result.hero).toBe("/new.jpg");
    expect(result.thumb).toBe("/new.jpg");
  });

  it("does not mutate nested objects while replacing image URLs", () => {
    const original = {
      media: { src: "https://picsum.photos/seed/g/960/960", alt: "cover" },
    };

    const result = replaceImageInProps(original, "/new.jpg");

    expect(result).not.toBe(original);
    expect(result.media).not.toBe(original.media);
    expect(original.media.src).toBe("https://picsum.photos/seed/g/960/960");
    expect((result.media as Record<string, unknown>).src).toBe("/new.jpg");
  });
});

// ─── replaceTextInProps ───────────────────────────────────────────────────────

describe("replaceTextInProps", () => {
  it("exact-match target wins over first-string fallback", () => {
    const { result, replaced } = replaceTextInProps(
      { title: "Hello", subtitle: "World" },
      "New text",
      "World",
    );
    expect(replaced).toBe(true);
    expect(result.subtitle).toBe("New text");
    expect(result.title).toBe("Hello"); // untouched
  });

  it("falls back to first non-empty, non-URL string when no exact match", () => {
    const { result, replaced } = replaceTextInProps(
      { title: "Hello", subtitle: "World" },
      "New text",
      "no-match",
    );
    expect(replaced).toBe(true);
    expect(result.title).toBe("New text");
    expect(result.subtitle).toBe("World"); // untouched
  });

  it("skips the id field in both passes", () => {
    const { replaced } = replaceTextInProps(
      { id: "abc-123" },
      "New text",
      "abc-123",
    );
    expect(replaced).toBe(false);
  });

  it("skips image URL strings in both passes", () => {
    const { replaced } = replaceTextInProps(
      { src: "https://picsum.photos/seed/g/960/960" },
      "New text",
      "https://picsum.photos/seed/g/960/960",
    );
    expect(replaced).toBe(false);
  });

  it("returns replaced=false when no eligible prop exists", () => {
    const { result, replaced } = replaceTextInProps(
      { count: 42, active: true },
      "New text",
      "anything",
    );
    expect(replaced).toBe(false);
    expect(result).toEqual({ count: 42, active: true });
  });

  it("skips empty string fields when choosing the fallback text target", () => {
    const { result, replaced } = replaceTextInProps(
      { title: "", subtitle: "World" },
      "New text",
      "no-match",
    );

    expect(replaced).toBe(true);
    expect(result.title).toBe("");
    expect(result.subtitle).toBe("New text");
  });

  it("does not mutate the original props object", () => {
    const original = { title: "Original" };
    replaceTextInProps(original, "New", "Original");
    expect(original.title).toBe("Original");
  });

  it("exact match on empty targetText does not match non-empty strings", () => {
    const { result, replaced } = replaceTextInProps(
      { title: "Hello" },
      "New",
      "",
    );
    // empty string won't exact-match "Hello", falls back to first string
    expect(replaced).toBe(true);
    expect(result.title).toBe("New");
  });
});
