"use client";

import { useQuery } from "@tanstack/react-query";

import usePagination from "@/components/common/custom/table/usePagination";
import { QUERY_KEYS } from "@/constant/queryKeys";
import { PAGE_SIZE } from "@/constant/table";
import fetchProjectMembers from "@/lib/members/fetchProjectMembers";
import { ProjectMemberResponseDTO } from "@/types/projectMember.dto";

export function useGetProjectMembers({
  projectId,
  skip,
  take,
  enabled = true,
  queryKey = [],
}: {
  projectId?: string | null;
  skip?: number;
  take?: number;
  enabled?: boolean;
  queryKey?: string[];
}) {
  const { page, setPage } = usePagination();
  const { data, error, isLoading } = useQuery<ProjectMemberResponseDTO>({
    queryKey: QUERY_KEYS.PROJECT_MEMBERS(projectId, page, ...queryKey),
    queryFn: () =>
      fetchProjectMembers({
        projectId,
        skip: skip ?? page * PAGE_SIZE,
        take: take ?? PAGE_SIZE,
      }),
    enabled: !!projectId && enabled,
  });

  return {
    data,
    error,
    isLoading,
    setPage,
    page,
  };
}
