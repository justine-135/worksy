"use client";

import { useQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/constant/queryKeys";
import fetchInvites from "@/lib/invite/fetchInvites";
import { ProjectInviteResponseDTO } from "@/types/projectInvite.dto";

export function useGetInvites({ receiverId }: { receiverId: string | null }) {
  const { data, error, isLoading } = useQuery<ProjectInviteResponseDTO[]>({
    queryKey: QUERY_KEYS.INVITES(receiverId),
    queryFn: () =>
      fetchInvites({
        receiverId,
      }),
    enabled: !!receiverId,
  });

  return { data, error, isLoading };
}
