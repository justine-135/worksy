"use client";

import { useQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/constant/queryKeys";
import fetchProfile from "@/lib/user/fetchProfile.lib";
import { useSessionStore } from "@/store/session.store";
import { UserProfileDTO } from "@/types/user.dto";

export function useGetUserProfile() {
  const userId = useSessionStore((s) => s.userId);

  return useQuery<UserProfileDTO>({
    queryKey: QUERY_KEYS.USER_PROFILE(userId),
    queryFn: fetchProfile,
    enabled: !!userId,
    // Profile rarely changes; skip redundant refetches on remount. A profile
    // save invalidates this key, which overrides staleTime.
    staleTime: 30_000,
  });
}
