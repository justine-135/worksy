"use client";

import { QUERY_KEYS } from "@/constant/queryKeys";
import fetchRoles from "@/lib/role/fetchRoles";
import { RolesResponseDTO } from "@/types/roles.dto";
import { useQuery } from "@tanstack/react-query";

export function useGetRoles({ projectId }: { projectId: string | null }) {
  const { data, error, isLoading } = useQuery<RolesResponseDTO[]>({
    queryKey: QUERY_KEYS.ROLES(projectId),
    queryFn: () =>
      fetchRoles({
        projectId,
      }),
    enabled: !!projectId,
  });

  return { data, error, isLoading };
}
