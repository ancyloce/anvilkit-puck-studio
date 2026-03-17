import * as React from "react";
import { useStore } from "zustand";
import { useEditorUiStoreApi } from "./ui-context";
import { useEditorI18nStoreApi } from "./i18n-context";

// UI hooks — subscribe by field
export function useActiveTab() {
  return useStore(useEditorUiStoreApi(), (s) => s.activeTab);
}
export function useSetActiveTab() {
  return useStore(useEditorUiStoreApi(), (s) => s.setActiveTab);
}
export function useDrawerSearch() {
  return useStore(useEditorUiStoreApi(), (s) => s.drawerSearch);
}
export function useSetDrawerSearch() {
  return useStore(useEditorUiStoreApi(), (s) => s.setDrawerSearch);
}
export function useDrawerCollapsed(group: string) {
  return useStore(useEditorUiStoreApi(), (s) => s.drawerCollapsed[group] ?? false);
}
export function useToggleDrawerGroup() {
  return useStore(useEditorUiStoreApi(), (s) => s.toggleDrawerGroup);
}
export function useOutlineExpanded(id: string) {
  return useStore(useEditorUiStoreApi(), (s) => s.outlineExpanded[id] ?? false);
}
export function useToggleOutlineItem() {
  return useStore(useEditorUiStoreApi(), (s) => s.toggleOutlineItem);
}
export function useTheme() {
  return useStore(useEditorUiStoreApi(), (s) => s.theme);
}
export function useToggleTheme() {
  return useStore(useEditorUiStoreApi(), (s) => s.toggleTheme);
}
/** Syncs the store theme value to document.documentElement.classList. */
export function useThemeSync() {
  const theme = useTheme();
  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);
}

// i18n hooks — subscribe by key, not by full messages object
export function useMsg(key: string): string {
  return useStore(useEditorI18nStoreApi(), (s) => s.messages[key] ?? key);
}
export function useLocale() {
  return useStore(useEditorI18nStoreApi(), (s) => s.locale);
}
export function useSetLocale() {
  return useStore(useEditorI18nStoreApi(), (s) => s.setLocale);
}
