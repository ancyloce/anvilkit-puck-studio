import "@testing-library/jest-dom";

// Stub ResizeObserver — not in jsdom
globalThis.ResizeObserver ??= class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
