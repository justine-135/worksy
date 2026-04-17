"use client";

import fetchProjects from "@/lib/project/fetchProjects.lib";
import { ProjectsResponseDTO } from "@/types/project.dto";
import { useQuery } from "@tanstack/react-query";

export function useGetProjects({ userId }: { userId?: string | null }) {
  const { data, error, isLoading } = useQuery<ProjectsResponseDTO[]>({
    queryKey: ["projects", userId],
    queryFn: () =>
      fetchProjects({
        userId,
      }),
  });

  return { data, error, isLoading };
}
