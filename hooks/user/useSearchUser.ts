"use client";

import { useQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/constant/queryKeys";
import fetchUserSearch from "@/lib/user/fetchUserSearch.lib";
import { UserResponseDTO } from "@/types/user.dto";

export function useSearchUser({
  query,
  currentId,
}: {
  query: string;
  currentId?: string | null;
}) {
  const { data, error, isLoading } = useQuery<UserResponseDTO[]>({
    queryKey: QUERY_KEYS.USER_SEARCH(query),
    queryFn: () =>
      fetchUserSearch({
        query,
        currentId,
      }),
    enabled: !!query && query.length >= 1,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
  });

  return { data: data || [], error, isLoading };
}
