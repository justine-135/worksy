import { create } from "zustand";

type SessionState = {
  userId: string | null;
  projectId: string | null;
  setUserId: (id: string | null) => void;
  setProjectId: (id: string | null) => void;
  clear: () => void;
};

export const useSessionStore = create<SessionState>((set) => ({
  userId: null,
  projectId: null,
  setProjectId: (id) => set({ projectId: id }),
  setUserId: (id) => set({ userId: id }),
  clear: () => set({ userId: null }),
}));
