export function createElementHighlighter() {
  let highlightedEl: HTMLElement | null = null;

  function set(el: HTMLElement | null, color: string): void {
    if (highlightedEl && highlightedEl !== el) {
      highlightedEl.style.outline = "";
      highlightedEl.style.outlineOffset = "";
    }

    if (el) {
      el.style.outline = `2px solid ${color}`;
      el.style.outlineOffset = "2px";
    }

    highlightedEl = el;
  }

  function clear(): void {
    set(null, "");
  }

  return { set, clear };
}
