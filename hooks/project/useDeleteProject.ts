"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import deleteProject from "@/lib/project/deleteProject.lib";
import { useSessionStore } from "@/store/session.store";

export function useDeleteProject(projectId?: string | null) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const userId = useSessionStore((s) => s.userId);

  return useMutation({
    mutationFn: () => deleteProject(projectId as string),
    // Cache invalidation in onSettled (the convention every other mutation hook
    // follows); navigation only on actual success.
    onSettled: async () => {
      // Prefix key on purpose: this matches every cached filter variant
      // (["projects", userId, "all" | "owned" | "shared" | "recent"]), which a
      // fully-qualified QUERY_KEYS.PROJECTS(userId) call would not.
      await queryClient.invalidateQueries({ queryKey: ["projects", userId] });
    },
    onSuccess: () => {
      router.push("/projects");
    },
  });
}
