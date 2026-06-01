"use client";

import { QUERY_KEYS } from "@/constant/queryKeys";
import fetchProjects from "@/lib/project/fetchProjects.lib";
import { ProjectsResponseDTO, TProjectFilter } from "@/types/project.dto";
import { useQuery } from "@tanstack/react-query";

export function useGetProjects({
  userId,
  filter = "all",
}: {
  userId: string | null;
  filter?: TProjectFilter;
}) {
  const { data, error, isLoading, refetch } = useQuery<ProjectsResponseDTO[]>({
    queryKey: QUERY_KEYS.PROJECTS(userId, filter),
    queryFn: () =>
      fetchProjects({
        userId,
        filter: filter || "all",
      }),
    enabled: !!userId,
  });

  return { data, error, isLoading, refetch };
}
