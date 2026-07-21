"use client";

import { useQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/constant/queryKeys";
import fetchInvites from "@/lib/invite/fetchInvites";
import { ProjectInviteResponseDTO } from "@/types/projectInvite.dto";

export function useGetInvites() {
  const { data, error, isLoading } = useQuery<ProjectInviteResponseDTO[]>({
    queryKey: QUERY_KEYS.INVITES(),
    queryFn: fetchInvites,
  });

  return { data, error, isLoading };
}
