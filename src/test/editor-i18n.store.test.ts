import { describe, it, expect, beforeEach } from "vitest";
import { createEditorI18nStore } from "@/store/editor-i18n/editor-i18n.store";

const messages = {
  "header.publish": "Publish",
};

function readLocalStorage(key: string): Record<string, unknown> | null {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  return JSON.parse(raw) as Record<string, unknown>;
}

describe("createEditorI18nStore — storeId namespacing", () => {
  beforeEach(() => localStorage.clear());

  it("uses anvilkit-i18n-{storeId} as the storage key", () => {
    const store = createEditorI18nStore({
      locale: "en",
      messages,
      storeId: "my-page",
    });

    store.getState().setLocale("zh", messages);

    expect(localStorage.getItem("anvilkit-i18n-my-page")).not.toBeNull();
  });

  it("defaults to anvilkit-i18n-default when no storeId is provided", () => {
    const store = createEditorI18nStore({
      locale: "en",
      messages,
    });

    store.getState().setLocale("zh", messages);

    expect(localStorage.getItem("anvilkit-i18n-default")).not.toBeNull();
  });

  it("two stores with different storeIds write to separate keys", () => {
    const a = createEditorI18nStore({
      locale: "en",
      messages,
      storeId: "page-a",
    });
    const b = createEditorI18nStore({
      locale: "zh",
      messages,
      storeId: "page-b",
    });

    a.getState().setLocale("en", messages);
    b.getState().setLocale("zh", messages);

    const aData = readLocalStorage("anvilkit-i18n-page-a");
    const bData = readLocalStorage("anvilkit-i18n-page-b");

    expect((aData?.state as Record<string, unknown>)?.locale).toBe("en");
    expect((bData?.state as Record<string, unknown>)?.locale).toBe("zh");
  });
});

describe("createEditorI18nStore — partialize", () => {
  beforeEach(() => localStorage.clear());

  it("persists locale only", () => {
    const store = createEditorI18nStore({
      locale: "en",
      messages,
      storeId: "partialize",
    });

    store.getState().setLocale("fr", {
      "header.publish": "Publier",
    });

    const data = readLocalStorage("anvilkit-i18n-partialize");
    const state = data?.state as Record<string, unknown>;

    expect(state.locale).toBe("fr");
    expect("messages" in state).toBe(false);
  });
});
