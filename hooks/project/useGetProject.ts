"use client";

import { useQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/constant/queryKeys";
import fetchProject from "@/lib/project/fetchProject.lib";
import { ProjectDetailDTO } from "@/types/project.dto";

export function useGetProject({
  projectId,
  enabled = true,
}: {
  projectId?: string | null;
  enabled?: boolean;
}) {
  return useQuery<ProjectDetailDTO>({
    queryKey: QUERY_KEYS.PROJECT(projectId),
    queryFn: () => fetchProject(projectId as string),
    enabled: !!projectId && enabled,
    // Low-volatility config; avoid refetching on every remount. Mutations still
    // force a refresh via invalidateQueries, which overrides staleTime.
    staleTime: 30_000,
  });
}
