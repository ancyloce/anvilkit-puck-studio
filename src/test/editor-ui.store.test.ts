import { describe, it, expect, beforeEach } from "vitest";
import { createEditorUiStore } from "@/store/editor-ui/editor-ui.store";

// ─── helpers ──────────────────────────────────────────────────────────────────

function readLocalStorage(key: string): Record<string, unknown> | null {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  return JSON.parse(raw) as Record<string, unknown>;
}

// ─── initial state ────────────────────────────────────────────────────────────

describe("createEditorUiStore — initial state", () => {
  beforeEach(() => localStorage.clear());

  it("starts with activeTab 'insert'", () => {
    const store = createEditorUiStore("test");
    expect(store.getState().activeTab).toBe("insert");
  });

  it("starts with theme 'light'", () => {
    const store = createEditorUiStore("test");
    expect(store.getState().theme).toBe("light");
  });

  it("starts with empty drawerSearch", () => {
    const store = createEditorUiStore("test");
    expect(store.getState().drawerSearch).toBe("");
  });

  it("starts with canvasViewport 'desktop'", () => {
    const store = createEditorUiStore("test");
    expect(store.getState().canvasViewport).toBe("desktop");
  });

  it("starts with empty drawerCollapsed and outlineExpanded records", () => {
    const store = createEditorUiStore("test");
    expect(store.getState().drawerCollapsed).toEqual({});
    expect(store.getState().outlineExpanded).toEqual({});
  });
});

// ─── actions ─────────────────────────────────────────────────────────────────

describe("createEditorUiStore — actions", () => {
  beforeEach(() => localStorage.clear());

  it("setActiveTab updates activeTab", () => {
    const store = createEditorUiStore("test");
    store.getState().setActiveTab("image");
    expect(store.getState().activeTab).toBe("image");
  });

  it("toggleTheme switches light → dark → light", () => {
    const store = createEditorUiStore("test");
    store.getState().toggleTheme();
    expect(store.getState().theme).toBe("dark");
    store.getState().toggleTheme();
    expect(store.getState().theme).toBe("light");
  });

  it("setDrawerSearch updates drawerSearch", () => {
    const store = createEditorUiStore("test");
    store.getState().setDrawerSearch("hero");
    expect(store.getState().drawerSearch).toBe("hero");
  });

  it("toggleDrawerGroup toggles collapsed state", () => {
    const store = createEditorUiStore("test");
    store.getState().toggleDrawerGroup("layout");
    expect(store.getState().drawerCollapsed["layout"]).toBe(true);
    store.getState().toggleDrawerGroup("layout");
    expect(store.getState().drawerCollapsed["layout"]).toBe(false);
  });

  it("toggleOutlineItem toggles expanded state", () => {
    const store = createEditorUiStore("test");
    store.getState().toggleOutlineItem("block-1");
    expect(store.getState().outlineExpanded["block-1"]).toBe(true);
    store.getState().toggleOutlineItem("block-1");
    expect(store.getState().outlineExpanded["block-1"]).toBe(false);
  });

  it("setCanvasViewport updates canvasViewport", () => {
    const store = createEditorUiStore("test");
    store.getState().setCanvasViewport("mobile");
    expect(store.getState().canvasViewport).toBe("mobile");
  });
});

// ─── localStorage key namespacing ─────────────────────────────────────────────

describe("createEditorUiStore — storeId namespacing", () => {
  beforeEach(() => localStorage.clear());

  it("uses anvilkit-ui-{storeId} as the storage key", () => {
    const store = createEditorUiStore("my-page");
    store.getState().setActiveTab("insert"); // trigger a persist write
    expect(localStorage.getItem("anvilkit-ui-my-page")).not.toBeNull();
  });

  it("two stores with different storeIds write to separate keys", () => {
    const a = createEditorUiStore("page-a");
    const b = createEditorUiStore("page-b");

    a.getState().setActiveTab("image");
    b.getState().setActiveTab("layer");

    const aData = readLocalStorage("anvilkit-ui-page-a");
    const bData = readLocalStorage("anvilkit-ui-page-b");

    expect((aData?.state as Record<string, unknown>)?.activeTab).toBe("image");
    expect((bData?.state as Record<string, unknown>)?.activeTab).toBe("layer");
  });

  it("stores do not share state across different storeIds", () => {
    const a = createEditorUiStore("alpha");
    const b = createEditorUiStore("beta");

    a.getState().toggleTheme();
    expect(a.getState().theme).toBe("dark");
    expect(b.getState().theme).toBe("light");
  });
});

// ─── partialize (what is and isn't persisted) ─────────────────────────────────

describe("createEditorUiStore — partialize", () => {
  beforeEach(() => localStorage.clear());

  it("persists activeTab", () => {
    const store = createEditorUiStore("p");
    store.getState().setActiveTab("text");
    const data = readLocalStorage("anvilkit-ui-p");
    expect((data?.state as Record<string, unknown>)?.activeTab).toBe("text");
  });

  it("persists theme", () => {
    const store = createEditorUiStore("p");
    store.getState().toggleTheme();
    const data = readLocalStorage("anvilkit-ui-p");
    expect((data?.state as Record<string, unknown>)?.theme).toBe("dark");
  });

  it("persists drawerCollapsed", () => {
    const store = createEditorUiStore("p");
    store.getState().toggleDrawerGroup("g");
    const data = readLocalStorage("anvilkit-ui-p");
    const state = (data?.state as Record<string, unknown>);
    expect((state?.drawerCollapsed as Record<string, unknown>)?.g).toBe(true);
  });

  it("persists outlineExpanded", () => {
    const store = createEditorUiStore("p");
    store.getState().toggleOutlineItem("node-1");
    const data = readLocalStorage("anvilkit-ui-p");
    const state = (data?.state as Record<string, unknown>);
    expect((state?.outlineExpanded as Record<string, unknown>)?.["node-1"]).toBe(true);
  });

  it("persists canvasViewport", () => {
    const store = createEditorUiStore("p");
    store.getState().setCanvasViewport("tablet");
    const data = readLocalStorage("anvilkit-ui-p");
    expect((data?.state as Record<string, unknown>)?.canvasViewport).toBe("tablet");
  });

  it("does NOT persist drawerSearch", () => {
    const store = createEditorUiStore("p");
    store.getState().setDrawerSearch("hello");
    const data = readLocalStorage("anvilkit-ui-p");
    const state = data?.state as Record<string, unknown>;
    expect("drawerSearch" in state).toBe(false);
  });
});
