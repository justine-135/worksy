"use client";

import fetchUser from "@/lib/user/fetchUser.lib";
import { UserResponseDTO } from "@/types/user.dto";
import { useQuery } from "@tanstack/react-query";

export function useSearchUser({
  query,
  currentId,
}: {
  query: string;
  currentId?: string | null;
}) {
  const { data, error, isLoading } = useQuery<UserResponseDTO[]>({
    queryKey: ["user", query],
    queryFn: () =>
      fetchUser({
        query,
        currentId,
      }),
    enabled: !!query && query.length >= 2,
    staleTime: 1000 * 60, // cache 1 minute
    gcTime: 1000 * 60 * 5,
  });

  return { data: data || [], error, isLoading };
}
