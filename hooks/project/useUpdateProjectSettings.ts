"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/constant/queryKeys";
import updateProjectSettings from "@/lib/project/updateProjectSettings.lib";
import { useSessionStore } from "@/store/session.store";
import { UpdateProjectSettingsDTO } from "@/types/project.dto";

import useInvalidateRecents from "./useInvalidateRecents";

export function useUpdateProjectSettings(projectId?: string | null) {
  const queryClient = useQueryClient();
  const userId = useSessionStore((s) => s.userId);
  const invalidateRecents = useInvalidateRecents();

  return useMutation({
    mutationFn: (data: UpdateProjectSettingsDTO) =>
      updateProjectSettings({ projectId: projectId as string, data }),
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.PROJECT(projectId),
      });
      // Title/description changes affect the projects list + sidebar too.
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.PROJECTS(userId),
      });
      await invalidateRecents();
    },
  });
}
