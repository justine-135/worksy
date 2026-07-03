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
    onSuccess: async () => {
      // Drop every cached view of the projects list (all/owned/shared/recent).
      await queryClient.invalidateQueries({ queryKey: ["projects", userId] });
      router.push("/projects");
    },
  });
}
