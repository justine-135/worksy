"use client";

import { useQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/constant/queryKeys";
import fetchProjectActivity from "@/lib/activity/fetchProjectActivity.lib";
import { ProjectActivityResponseDTO } from "@/types/activityLog.dto";

export function useGetActivity({
  projectId,
  limit,
}: {
  projectId?: string | null;
  limit?: number;
}) {
  const { data, error, isLoading } = useQuery<ProjectActivityResponseDTO[]>({
    queryKey: QUERY_KEYS.ACTIVITY(projectId, limit),
    queryFn: () => fetchProjectActivity({ projectId: projectId as string, limit }),
    enabled: !!projectId,
  });

  return { data, error, isLoading };
}
