import { create } from "zustand";

type SessionState = {
  userId: string | null;
  projectId: string | null;
  userPermissions: string[];
  isLoadingPermissions: boolean;
  setUserId: (id: string | null) => void;
  setProjectId: (id: string | null) => void;
  fetchPermissions: (projectId: string, userId: string) => Promise<void>;
  hasPermission: (permissionKey: string) => boolean;
  clear: () => void;
};

export const useSessionStore = create<SessionState>((set, get) => ({
  userId: null,
  projectId: null,
  userPermissions: [],
  isLoadingPermissions: false,

  setUserId: (id) => set({ userId: id }),

  setProjectId: (id) => {
    set({ projectId: id });
    if (!id) {
      set({ userPermissions: [] });
    }
  },

  fetchPermissions: async (projectId: string) => {
    if (get().isLoadingPermissions) {
      return;
    }

    set({ isLoadingPermissions: true });
    try {
      const response = await fetch(
        `/api/permission/check?projectId=${projectId}`,
      );

      if (!response.ok) {
        throw new Error("Failed to load permissions payload");
      }

      const data = await response.json();

      set({
        userPermissions: data.permissions || [],
        isLoadingPermissions: false,
      });
    } catch (error) {
      console.error("Error setting session permissions in Zustand:", error);
      set({ userPermissions: [], isLoadingPermissions: false });
    }
  },

  hasPermission: (permissionKey: string) => {
    return get().userPermissions.includes(permissionKey);
  },

  clear: () => set({ userId: null, projectId: null, userPermissions: [] }),
}));
