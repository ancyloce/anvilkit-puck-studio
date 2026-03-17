// Runtime exports
export { puckOverrides } from "./components/overrides/index";
export { Studio } from "./components/editor/Studio";

// Public types — all consumer-facing types live in src/types/public.ts
export type {
  StudioProps,
  ImagesProps,
  ImageItem,
  CopywritingProps,
  CopywritingItem,
  EditorUiStore,
  EditorUiStoreApi,
  ActiveTab,
  EditorI18nStoreApi,
  Locale,
  Messages,
} from "./types/public";

// Store factories and context (advanced / escape-hatch usage)
export { createEditorUiStore, createEditorI18nStore } from "./store/index";
export { EditorUiStoreProvider, useEditorUiStoreApi } from "./store/ui-context";
export { EditorI18nStoreProvider, useEditorI18nStoreApi } from "./store/i18n-context";
export { defaultMessages } from "./store/i18n-defaults";
