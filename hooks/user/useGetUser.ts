"use client";

import { useQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/constant/queryKeys";
import fetchUserById from "@/lib/user/fetchUserByID";
import { UserResponseDTO } from "@/types/user.dto";

export function useGetUser() {
  const { data, error, isLoading } = useQuery<UserResponseDTO>({
    queryKey: QUERY_KEYS.USER(),
    queryFn: fetchUserById,
  });

  return { data, error, isLoading };
}
