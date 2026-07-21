"use client";

import { useQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/constant/queryKeys";
import fetchProjects from "@/lib/project/fetchProjects.lib";
import { ProjectsResponseDTO, TProjectFilter } from "@/types/project.dto";

export function useGetProjects({
  filter = "all",
}: {
  filter?: TProjectFilter;
}) {
  const { data, error, isLoading, refetch } = useQuery<ProjectsResponseDTO[]>({
    queryKey: QUERY_KEYS.PROJECTS(filter),
    queryFn: () =>
      fetchProjects({
        filter: filter || "all",
      }),
  });

  return { data, error, isLoading, refetch };
}
