import { create } from "zustand";

type SidebarState = {
  collapsed: boolean;
  toggle: () => void;
  setCollapsed: (collapsed: boolean) => void;
};

// Shared so both the fixed sidebar and the layout spacer/main area react to the
// same collapse state (the sidebar is `fixed`, so the spacer width is what lets
// the main content stretch into the reclaimed space).
export const useSidebarStore = create<SidebarState>((set) => ({
  collapsed: false,
  toggle: () => set((s) => ({ collapsed: !s.collapsed })),
  setCollapsed: (collapsed) => set({ collapsed }),
}));
