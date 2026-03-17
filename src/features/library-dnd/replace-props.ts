/**
 * Prop-replacement utilities for the library drop bridge.
 * Pure functions — no React, no side effects.
 */

type Props = Record<string, unknown>;

export function isImageUrl(val: string): boolean {
  return (
    /\.(jpg|jpeg|png|gif|webp|svg|avif)(\?.*)?$/i.test(val) ||
    val.includes("picsum.photos") ||
    val.includes("unsplash.com") ||
    val.includes("images.") ||
    val.startsWith("data:image/")
  );
}

export function replaceImageInProps(props: Props, newSrc: string): Props {
  const result: Props = {};
  for (const key of Object.keys(props)) {
    const val = props[key];
    if (typeof val === "string" && isImageUrl(val)) {
      result[key] = newSrc;
    } else if (Array.isArray(val)) {
      result[key] = val.map((item) =>
        item && typeof item === "object"
          ? replaceImageInProps(item as Props, newSrc)
          : item,
      );
    } else if (val && typeof val === "object") {
      result[key] = replaceImageInProps(val as Props, newSrc);
    } else {
      result[key] = val;
    }
  }
  return result;
}

export function replaceTextInProps(
  props: Props,
  newText: string,
  targetText: string,
): { result: Props; replaced: boolean } {
  // First pass: exact match on targetText
  for (const key of Object.keys(props)) {
    if (key === "id") continue;
    const val = props[key];
    if (
      typeof val === "string" &&
      val === targetText &&
      !isImageUrl(val)
    ) {
      return { result: { ...props, [key]: newText }, replaced: true };
    }
  }
  // Second pass: first non-empty, non-URL string prop
  for (const key of Object.keys(props)) {
    if (key === "id") continue;
    const val = props[key];
    if (typeof val === "string" && !isImageUrl(val) && val.length > 0) {
      return { result: { ...props, [key]: newText }, replaced: true };
    }
  }
  return { result: props, replaced: false };
}
