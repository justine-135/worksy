"use client";

import { useQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/constant/queryKeys";
import fetchAssignees from "@/lib/members/fetchAssignees";
import { ProjectMemberResponseDTO } from "@/types/projectMember.dto";

export function useGetAssignees({
  projectId,

  enabled = true,
}: {
  projectId?: string | null;

  enabled?: boolean;
  queryKey?: string[];
}) {
  const { data, error, isLoading } = useQuery<ProjectMemberResponseDTO>({
    queryKey: QUERY_KEYS.PROJECT_MEMBERS(projectId),
    queryFn: () =>
      fetchAssignees({
        projectId,
      }),
    enabled: !!projectId && enabled,
  });

  return {
    data,
    error,
    isLoading,
  };
}
