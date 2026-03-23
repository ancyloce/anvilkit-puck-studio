import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useGhostDrag } from "@/features/library-dnd/useGhostDrag";
import {
  LIBRARY_DRAG_START,
  IMAGE_DROP,
  TEXT_DROP,
  addLibraryDragEventListener,
} from "@/features/library-dnd/drop-contract";
import type { LibraryDragStartDetail, ImageDropDetail, TextDropDetail } from "@/features/library-dnd/drop-contract";

// ─── helpers ──────────────────────────────────────────────────────────────────

function makePointerEvent(
  type: string,
  init: Partial<PointerEventInit> = {},
): PointerEvent {
  return new PointerEvent(type, {
    bubbles: true,
    clientX: 0,
    clientY: 0,
    pointerId: 1,
    ...init,
  });
}

function buildDragTarget(): HTMLElement {
  const el = document.createElement("div");
  document.body.appendChild(el);
  el.setPointerCapture = vi.fn();
  el.releasePointerCapture = vi.fn();
  return el;
}

function makeReactPointerEvent(
  init: { clientX?: number; clientY?: number; pointerId?: number },
  currentTarget: HTMLElement,
): React.PointerEvent<HTMLElement> {
  return {
    stopPropagation: vi.fn(),
    currentTarget,
    pointerId: init.pointerId ?? 1,
    clientX: init.clientX ?? 0,
    clientY: init.clientY ?? 0,
  } as unknown as React.PointerEvent<HTMLElement>;
}

/** Cleans up any open drag by dispatching a final pointerup. */
function cleanupDrag() {
  window.dispatchEvent(makePointerEvent("pointerup"));
}

// ─── ghost lifecycle ──────────────────────────────────────────────────────────

describe("useGhostDrag — ghost lifecycle", () => {
  let target: HTMLElement;
  let ghostEl: HTMLDivElement;
  let createGhostEl: (payload: string) => HTMLDivElement;

  beforeEach(() => {
    document.body.innerHTML = "";
    target = buildDragTarget();

    // Factory appends to body (as real implementations do); data-ghost attr
    // distinguishes the ghost from the drag target div.
    createGhostEl = vi.fn((payload: string) => {
      const el = document.createElement("div");
      el.setAttribute("data-ghost", "true");
      el.textContent = payload;
      document.body.appendChild(el);
      return el;
    });
  });

  afterEach(() => {
    cleanupDrag();
    document.body.innerHTML = "";
  });

  it("creates ghost element with the given payload", () => {
    const { result } = renderHook(() => useGhostDrag({ createGhostEl }));

    act(() => {
      result.current.startDrag(
        makeReactPointerEvent({ clientX: 50, clientY: 80 }, target),
        "image",
        "https://img.test/a.jpg",
      );
    });

    expect(createGhostEl).toHaveBeenCalledWith("https://img.test/a.jpg");
  });

  it("positions ghost at clientX+12, clientY+12", () => {
    const { result } = renderHook(() => useGhostDrag({ createGhostEl }));

    act(() => {
      result.current.startDrag(
        makeReactPointerEvent({ clientX: 100, clientY: 200 }, target),
        "image",
        "img",
      );
    });

    ghostEl = document.body.querySelector("[data-ghost]") as HTMLDivElement;
    expect(ghostEl).not.toBeNull();
    expect(ghostEl.style.left).toBe("112px");
    expect(ghostEl.style.top).toBe("212px");
  });

  it("moves ghost on pointermove", () => {
    const { result } = renderHook(() => useGhostDrag({ createGhostEl }));

    act(() => {
      result.current.startDrag(
        makeReactPointerEvent({ clientX: 0, clientY: 0 }, target),
        "text",
        "hello",
      );
    });

    act(() => {
      window.dispatchEvent(makePointerEvent("pointermove", { clientX: 300, clientY: 400 }));
    });

    ghostEl = document.body.querySelector("[data-ghost]") as HTMLDivElement;
    expect(ghostEl.style.left).toBe("312px");
    expect(ghostEl.style.top).toBe("412px");
  });

  it("removes ghost from DOM on pointerup", () => {
    const { result } = renderHook(() => useGhostDrag({ createGhostEl }));

    act(() => {
      result.current.startDrag(
        makeReactPointerEvent({}, target),
        "image",
        "img",
      );
    });

    expect(document.body.querySelector("[data-ghost]")).not.toBeNull();

    act(() => {
      window.dispatchEvent(makePointerEvent("pointerup"));
    });

    expect(document.body.querySelector("[data-ghost]")).toBeNull();
  });
});

// ─── event dispatch ───────────────────────────────────────────────────────────

describe("useGhostDrag — event dispatch", () => {
  let target: HTMLElement;
  const createGhostEl = (payload: string) => {
    const el = document.createElement("div");
    el.setAttribute("data-ghost", "true");
    el.textContent = payload;
    document.body.appendChild(el);
    return el;
  };

  beforeEach(() => {
    document.body.innerHTML = "";
    target = buildDragTarget();
  });

  afterEach(() => {
    cleanupDrag();
    document.body.innerHTML = "";
  });

  it("dispatches librarydragstart on startDrag with correct type", () => {
    const { result } = renderHook(() => useGhostDrag({ createGhostEl }));

    const received: LibraryDragStartDetail[] = [];
    const cleanup = addLibraryDragEventListener(LIBRARY_DRAG_START, (e) => {
      received.push(e.detail);
    });

    act(() => {
      result.current.startDrag(
        makeReactPointerEvent({}, target),
        "image",
        "x",
      );
    });

    cleanup();
    expect(received).toHaveLength(1);
    expect(received[0].type).toBe("image");
  });

  it("dispatches librarydragstart with type 'text' for text drags", () => {
    const { result } = renderHook(() => useGhostDrag({ createGhostEl }));

    const received: LibraryDragStartDetail[] = [];
    const cleanup = addLibraryDragEventListener(LIBRARY_DRAG_START, (e) => {
      received.push(e.detail);
    });

    act(() => {
      result.current.startDrag(makeReactPointerEvent({}, target), "text", "copy");
    });

    cleanup();
    expect(received[0].type).toBe("text");
  });

  it("dispatches imagedrop with payload on pointerup when type is image", () => {
    const { result } = renderHook(() => useGhostDrag({ createGhostEl }));

    const received: ImageDropDetail[] = [];
    const cleanup = addLibraryDragEventListener(IMAGE_DROP, (e) => {
      received.push(e.detail);
    });

    act(() => {
      result.current.startDrag(
        makeReactPointerEvent({}, target),
        "image",
        "https://img.test/photo.jpg",
      );
    });

    act(() => {
      window.dispatchEvent(makePointerEvent("pointerup", { clientX: 120, clientY: 240 }));
    });

    cleanup();
    expect(received).toHaveLength(1);
    expect(received[0]).toEqual({
      src: "https://img.test/photo.jpg",
      clientX: 120,
      clientY: 240,
    });
  });

  it("dispatches textdrop with payload on pointerup when type is text", () => {
    const { result } = renderHook(() => useGhostDrag({ createGhostEl }));

    const received: TextDropDetail[] = [];
    const cleanup = addLibraryDragEventListener(TEXT_DROP, (e) => {
      received.push(e.detail);
    });

    act(() => {
      result.current.startDrag(
        makeReactPointerEvent({}, target),
        "text",
        "Buy now!",
      );
    });

    act(() => {
      window.dispatchEvent(makePointerEvent("pointerup", { clientX: 55, clientY: 66 }));
    });

    cleanup();
    expect(received).toHaveLength(1);
    expect(received[0]).toEqual({ text: "Buy now!", clientX: 55, clientY: 66 });
  });

  it("does not dispatch textdrop when type is image", () => {
    const { result } = renderHook(() => useGhostDrag({ createGhostEl }));

    const textDrops: TextDropDetail[] = [];
    const cleanup = addLibraryDragEventListener(TEXT_DROP, (e) => {
      textDrops.push(e.detail);
    });

    act(() => {
      result.current.startDrag(makeReactPointerEvent({}, target), "image", "img.jpg");
    });

    act(() => { window.dispatchEvent(makePointerEvent("pointerup")); });

    cleanup();
    expect(textDrops).toHaveLength(0);
  });

  it("does not dispatch imagedrop when type is text", () => {
    const { result } = renderHook(() => useGhostDrag({ createGhostEl }));

    const imageDrops: ImageDropDetail[] = [];
    const cleanup = addLibraryDragEventListener(IMAGE_DROP, (e) => {
      imageDrops.push(e.detail);
    });

    act(() => {
      result.current.startDrag(makeReactPointerEvent({}, target), "text", "words");
    });

    act(() => { window.dispatchEvent(makePointerEvent("pointerup")); });

    cleanup();
    expect(imageDrops).toHaveLength(0);
  });
});

// ─── window listener cleanup ──────────────────────────────────────────────────

describe("useGhostDrag — window listener cleanup after pointerup", () => {
  const createGhostEl = () => {
    const el = document.createElement("div");
    el.setAttribute("data-ghost", "true");
    document.body.appendChild(el);
    return el;
  };

  beforeEach(() => {
    document.body.innerHTML = "";
  });

  afterEach(() => {
    cleanupDrag();
    document.body.innerHTML = "";
  });

  it("does not emit a second drop event when pointerup fires twice", () => {
    const target = buildDragTarget();
    const { result } = renderHook(() => useGhostDrag({ createGhostEl }));

    const drops: ImageDropDetail[] = [];
    const cleanup = addLibraryDragEventListener(IMAGE_DROP, (e) => {
      drops.push(e.detail);
    });

    act(() => {
      result.current.startDrag(makeReactPointerEvent({}, target), "image", "img");
    });

    act(() => { window.dispatchEvent(makePointerEvent("pointerup")); });
    act(() => { window.dispatchEvent(makePointerEvent("pointerup")); });

    cleanup();
    expect(drops).toHaveLength(1);
  });

  it("does not move ghost after pointerup (listener removed)", () => {
    const target = buildDragTarget();
    const { result } = renderHook(() => useGhostDrag({ createGhostEl }));

    act(() => {
      result.current.startDrag(makeReactPointerEvent({ clientX: 0, clientY: 0 }, target), "image", "img");
    });

    act(() => { window.dispatchEvent(makePointerEvent("pointerup")); });

    // Ghost is gone; pointermove should not error or reattach it
    act(() => {
      window.dispatchEvent(makePointerEvent("pointermove", { clientX: 999, clientY: 999 }));
    });

    expect(document.body.querySelector("[data-ghost]")).toBeNull();
  });
});

// ─── stopPropagation ──────────────────────────────────────────────────────────

describe("useGhostDrag — stopPropagation", () => {
  afterEach(() => cleanupDrag());

  it("calls e.stopPropagation on startDrag", () => {
    document.body.innerHTML = "";
    const target = buildDragTarget();
    const { result } = renderHook(() =>
      useGhostDrag({
        createGhostEl: () => {
          const el = document.createElement("div");
          document.body.appendChild(el);
          return el;
        },
      }),
    );

    const fakeEvent = makeReactPointerEvent({}, target);
    act(() => {
      result.current.startDrag(fakeEvent, "text", "copy");
    });

    expect(fakeEvent.stopPropagation).toHaveBeenCalled();
  });
});
