"use client";

import { QUERY_KEYS } from "@/constant/queryKeys";
import fetchProjects from "@/lib/project/fetchProjects.lib";
import { ProjectsResponseDTO } from "@/types/project.dto";
import { useQuery } from "@tanstack/react-query";

export function useGetProjects({ userId }: { userId: string | null }) {
  const { data, error, isLoading } = useQuery<ProjectsResponseDTO[]>({
    queryKey: QUERY_KEYS.PROJECTS(userId),
    queryFn: () =>
      fetchProjects({
        userId,
      }),
    enabled: !!userId,
  });

  return { data, error, isLoading };
}
