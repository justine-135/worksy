"use client";

import { useQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/constant/queryKeys";
import fetchMemberActivity from "@/lib/activity/fetchMemberActivity.lib";
import { ActivityLogResponseDTO } from "@/types/activityLog.dto";

export function useGetMemberActivity({
  projectId,
  memberId,
  enabled = true,
}: {
  projectId?: string | null;
  memberId?: string | null;
  enabled?: boolean;
}) {
  const { data, error, isLoading } = useQuery<ActivityLogResponseDTO[]>({
    queryKey: QUERY_KEYS.MEMBER_ACTIVITY(projectId, memberId),
    queryFn: () =>
      fetchMemberActivity({
        projectId: projectId as string,
        memberId: memberId as string,
      }),
    enabled: !!projectId && !!memberId && enabled,
  });

  return { data, error, isLoading };
}
