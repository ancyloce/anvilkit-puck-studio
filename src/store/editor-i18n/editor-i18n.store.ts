import { createStore } from "zustand";
import { persist } from "zustand/middleware";

export type EditorLocale = string;
export type Locale = EditorLocale;

export type EditorMessages = Record<string, string>;
export type Messages = EditorMessages;

export interface EditorI18nStore {
  locale: EditorLocale;
  messages: EditorMessages;
  setLocale: (locale: EditorLocale, messages: EditorMessages) => void;
}

export type EditorI18nStoreApi = ReturnType<typeof createEditorI18nStore>;

export function createEditorI18nStore(initial: {
  locale: EditorLocale;
  messages: EditorMessages;
  storeId?: string;
}) {
  const storeId = initial.storeId ?? "default";

  return createStore<EditorI18nStore>()(
    persist(
      (set) => ({
        locale: initial.locale,
        messages: initial.messages,
        setLocale: (locale, messages) => set({ locale, messages }),
      }),
      {
        name: `anvilkit-i18n-${storeId}`,
        // Only persist locale — messages are re-loaded from props on mount
        partialize: (state) => ({ locale: state.locale }),
      },
    ),
  );
}
