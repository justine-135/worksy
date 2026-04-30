"use client";

import fetchRoles from "@/lib/role/fetchRoles";
import { RolesResponseDTO } from "@/types/roles.dto";
import { useQuery } from "@tanstack/react-query";

export function useGetRoles({ projectId }: { projectId?: string | null }) {
  const { data, error, isLoading } = useQuery<RolesResponseDTO[]>({
    queryKey: ["roles", projectId],
    queryFn: () =>
      fetchRoles({
        projectId,
      }),
    enabled: !!projectId,
  });

  return { data, error, isLoading };
}
