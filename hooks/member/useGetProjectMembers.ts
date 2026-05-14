"use client";

import { QUERY_KEYS } from "@/constant/queryKeys";
import fetchProjectMembers from "@/lib/members/fetchProjectMembers";
import {
  ProjectMemberResponseDTO,
  ProjectMemberTableDTO,
} from "@/types/projectMember.dto";
import { useQuery } from "@tanstack/react-query";

export function useGetProjectMembers({
  projectId,
}: {
  projectId?: string | null;
}) {
  const { data, error, isLoading } = useQuery<ProjectMemberResponseDTO[]>({
    queryKey: QUERY_KEYS.PROJECT_MEMBERS(projectId),
    queryFn: () =>
      fetchProjectMembers({
        projectId,
      }),
    enabled: !!projectId,
  });

  const transformData = (): ProjectMemberTableDTO[] => {
    if (!data) return [];
    return data.map((member) => ({
      id: member.id,
      name: member.user.name,
      email: member.user.email,
      role: {
        name: member?.role?.name,
        id: member?.role?.id,
      },
      createdAt: member.createdAt as unknown as string,
      status: member.status,
    }));
  };

  return { data: transformData(), error, isLoading };
}
