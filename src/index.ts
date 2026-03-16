export { puckOverrides } from "./components/overrides/index";
export { Studio } from "./components/editor/Studio";
export type { StudioProps, ImagesProps, CopywritingProps } from "./components/editor/Studio";
export type { ImageItem } from "./components/layout/sidebar/library/ImageLibrary";
export type { CopywritingItem } from "./components/layout/sidebar/library/CopyLibrary";

// New store API
export { createEditorUiStore, createEditorI18nStore } from "./store/index";
export type { EditorUiStore, EditorUiStoreApi, EditorI18nStoreApi, Locale, Messages } from "./store/index";

/**
 * @deprecated Use createEditorUiStore() via EditorUiStoreProvider instead.
 * This singleton will be removed in the next minor version.
 */
export { uiStore } from "./store/index";

/** @deprecated Use EditorUiStore instead. */
export type { UIStore } from "./store/index";
