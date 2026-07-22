"use client";

import { useQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/constant/queryKeys";
import { PAGE_SIZE } from "@/constant/table";
import fetchProjectMembers from "@/lib/members/fetchProjectMembers";
import { ProjectMemberResponseDTO } from "@/types/projectMember.dto";

export function useGetProjectMembers({
  projectId,
  page,
  skip,
  take,
  enabled = true,
  queryKey = [],
}: {
  projectId?: string | null;
  page?: number;
  skip?: number;
  take?: number;
  enabled?: boolean;
  queryKey?: string[];
}) {
  const { data, error, isLoading } = useQuery<ProjectMemberResponseDTO>({
    queryKey: QUERY_KEYS.PROJECT_MEMBERS(projectId, page, ...queryKey),
    queryFn: () =>
      fetchProjectMembers({
        projectId,
        skip: skip ?? (page ?? 1) * PAGE_SIZE,
        take: take ?? PAGE_SIZE,
      }),
    enabled: !!projectId && enabled,
  });

  return {
    data,
    error,
    isLoading,
  };
}
