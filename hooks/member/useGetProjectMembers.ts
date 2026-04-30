"use client";

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
    queryKey: ["projects", projectId],
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
      role: member?.role?.name || "Unassigned",
      createdAt: member.createdAt as unknown as string,
    }));
  };

  return { data: transformData(), error, isLoading };
}
