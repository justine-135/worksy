import { create } from "zustand";

type SessionState = {
  userId: string | null;
  setUserId: (id: string | null) => void;
  clear: () => void;
};

export const useSessionStore = create<SessionState>((set) => ({
  userId: null,

  setUserId: (id) => set({ userId: id }),
  clear: () => set({ userId: null }),
}));
