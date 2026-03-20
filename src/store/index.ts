import { createEditorUiStore as _createEditorUiStore } from "./editor-ui";

// Store factories
export { createEditorUiStore } from "./editor-ui";
export type { EditorUiStore, EditorUiStoreApi } from "./editor-ui";

export { createEditorI18nStore } from "./editor-i18n";
export type { EditorI18nStore, EditorI18nStoreApi, Locale, Messages } from "./editor-i18n";

// Context providers + hooks that return the store API
export { EditorUiStoreProvider, useEditorUiStoreApi } from "./editor-ui";
export { EditorI18nStoreProvider, useEditorI18nStoreApi } from "./editor-i18n";

// Named component hooks
export {
  useActiveTab,
  useSetActiveTab,
  useDrawerSearch,
  useSetDrawerSearch,
  useDrawerCollapsed,
  useToggleDrawerGroup,
  useOutlineExpanded,
  useToggleOutlineItem,
  useCanvasViewport,
  useSetCanvasViewport,
  useCanvasZoomConfig,
  useCanvasZoom,
  useCanvasAutoZoom,
  useCanvasRootHeight,
  useSetCanvasZoomConfig,
  useSetCanvasZoom,
  useCanvasLibraryDragType,
  useSetCanvasLibraryDragType,
  useTheme,
  useToggleTheme,
} from "./editor-ui";
export { useMsg, useLocale, useSetLocale } from "./editor-i18n";

// Default messages
export { defaultMessages } from "./editor-i18n";

/**
 * @deprecated Use createEditorUiStore() via EditorUiStoreProvider instead.
 * This singleton will be removed in the next minor version.
 */
export const uiStore = _createEditorUiStore("default");

/** @deprecated Use EditorUiStore instead. */
export type { EditorUiStore as UIStore } from "./editor-ui";
