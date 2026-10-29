"use client";

import { useQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/constant/queryKeys";
import { PAGE_SIZE } from "@/constant/table";
import fetchRoles from "@/lib/role/fetchRoles";
import { RolesResponseDTO } from "@/types/roles.dto";

export function useGetRoles({
  projectId,
  page,
  skip,
  take,
  search,
}: {
  projectId?: string | null;
  page?: number;
  skip?: number;
  take?: number;
  enabled?: boolean;
  queryKey?: string[];
  search?: string;
}) {
  const { data, error, isLoading } = useQuery<RolesResponseDTO>({
    queryKey: QUERY_KEYS.ROLES(projectId, search, page),
    queryFn: () =>
      fetchRoles({
        projectId,
        skip: skip ?? (page ?? 0) * PAGE_SIZE,
        take: take ?? PAGE_SIZE,
        search,
      }),
    enabled: !!projectId,
  });

  return { data, error, isLoading };
}
