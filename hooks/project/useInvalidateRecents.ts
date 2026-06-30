"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { QUERY_KEYS } from "@/constant/queryKeys";
import { useSessionStore } from "@/store/session.store";

/**
 * Returns a function that refreshes the sidebar "Recents" list. Call it in a
 * mutation's `onSettled` so the project jumps to the top immediately after the
 * server stamps `lastActivityAt` (see `touchProjectActivity`).
 */
export default function useInvalidateRecents() {
  const queryClient = useQueryClient();
  const userId = useSessionStore((s) => s.userId);

  return useCallback(
    () =>
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.PROJECTS(userId, "recent"),
      }),
    [queryClient, userId],
  );
}
