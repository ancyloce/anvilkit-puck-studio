import { createStore } from "zustand";
import { persist } from "zustand/middleware";

export type ActiveTab = "insert" | "layer" | "image" | "text" | "copilot";

interface DrawerSlice {
  drawerSearch: string;
  setDrawerSearch: (q: string) => void;
  drawerCollapsed: Record<string, boolean>;
  toggleDrawerGroup: (group: string) => void;
}

interface AsideSlice {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

interface OutlineSlice {
  outlineExpanded: Record<string, boolean>;
  toggleOutlineItem: (id: string) => void;
}

interface ThemeSlice {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

export type EditorUiStore = DrawerSlice & AsideSlice & OutlineSlice & ThemeSlice;

export type EditorUiStoreApi = ReturnType<typeof createEditorUiStore>;

export function createEditorUiStore(storeId: string) {
  return createStore<EditorUiStore>()(
    persist(
      (set) => ({
        drawerSearch: "",
        setDrawerSearch: (q) => set({ drawerSearch: q }),
        drawerCollapsed: {},
        toggleDrawerGroup: (group) =>
          set((s) => ({
            drawerCollapsed: { ...s.drawerCollapsed, [group]: !s.drawerCollapsed[group] },
          })),
        activeTab: "insert",
        setActiveTab: (tab) => set({ activeTab: tab }),
        outlineExpanded: {},
        toggleOutlineItem: (id) =>
          set((s) => ({
            outlineExpanded: { ...s.outlineExpanded, [id]: !s.outlineExpanded[id] },
          })),
        theme: "light",
        toggleTheme: () =>
          set((s) => {
            const next = s.theme === "light" ? "dark" : "light";
            return { theme: next };
          }),
      }),
      {
        name: `anvilkit-ui-${storeId}`,
        partialize: (s) => ({
          activeTab: s.activeTab,
          drawerCollapsed: s.drawerCollapsed,
          outlineExpanded: s.outlineExpanded,
          theme: s.theme,
          // drawerSearch intentionally excluded — transient input
        }),
      }
    )
  );
}
