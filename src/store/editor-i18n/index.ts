export { createEditorI18nStore } from "./editor-i18n.store";
export type {
  EditorI18nStore,
  EditorI18nStoreApi,
  EditorLocale,
  Locale,
  EditorMessages,
  Messages,
} from "./editor-i18n.store";

export { EditorI18nStoreProvider, useEditorI18nStoreApi } from "./editor-i18n.context";

export { useMsg, useLocale, useSetLocale } from "./editor-i18n.hooks";

export { defaultMessages } from "./default-messages";
export { defaultMessages as enMessages } from "@/i18n/en";
export { defaultMessages as zhMessages } from "@/i18n/zh";
