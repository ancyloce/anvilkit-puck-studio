const TEXT_TAGS = new Set([
  "P",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "SPAN",
  "A",
  "LI",
  "BUTTON",
  "LABEL",
]);

export function getIframeCoords(
  iframeEl: HTMLIFrameElement,
  clientX: number,
  clientY: number,
): { x: number; y: number } | null {
  const rect = iframeEl.getBoundingClientRect();
  const x = clientX - rect.left;
  const y = clientY - rect.top;

  if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
    return null;
  }

  return { x, y };
}

export function getComponentElAt(
  iframeDoc: Document,
  iframeEl: HTMLIFrameElement,
  clientX: number,
  clientY: number,
): HTMLElement | null {
  const coords = getIframeCoords(iframeEl, clientX, clientY);
  if (!coords) return null;

  const element = iframeDoc.elementFromPoint(coords.x, coords.y);
  if (!element) return null;

  return element.closest("[data-puck-component]") as HTMLElement | null;
}

export function getImageElInComponent(
  compEl: HTMLElement,
  iframeEl: HTMLIFrameElement,
  clientX: number,
  clientY: number,
): HTMLImageElement | null {
  const images = Array.from(compEl.querySelectorAll("img"));
  if (!images.length) return null;
  if (images.length === 1) return images[0] as HTMLImageElement;

  const rect = iframeEl.getBoundingClientRect();
  const x = clientX - rect.left;
  const y = clientY - rect.top;

  let closest: HTMLImageElement | null = null;
  let minDistance = Infinity;

  for (const image of images) {
    const imageRect = image.getBoundingClientRect();
    const centerX = imageRect.left + imageRect.width / 2;
    const centerY = imageRect.top + imageRect.height / 2;
    const distance = Math.hypot(centerX - x, centerY - y);

    if (distance < minDistance) {
      minDistance = distance;
      closest = image as HTMLImageElement;
    }
  }

  return closest;
}

export function getTextElInComponent(
  iframeDoc: Document,
  iframeEl: HTMLIFrameElement,
  compEl: HTMLElement,
  clientX: number,
  clientY: number,
): HTMLElement | null {
  const coords = getIframeCoords(iframeEl, clientX, clientY);
  if (!coords) return null;

  const element = iframeDoc.elementFromPoint(coords.x, coords.y);
  if (element && compEl.contains(element)) {
    let current: Element | null = element;
    while (current && current !== iframeDoc.body) {
      if (TEXT_TAGS.has(current.tagName) && current.textContent?.trim()) {
        return current as HTMLElement;
      }
      current = current.parentElement;
    }
  }

  for (const tag of TEXT_TAGS) {
    const candidate = compEl.querySelector(tag.toLowerCase());
    if (candidate?.textContent?.trim()) {
      return candidate as HTMLElement;
    }
  }

  return null;
}
