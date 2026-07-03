"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/constant/queryKeys";
import updateProfile from "@/lib/user/updateProfile.lib";
import { UpdateProfileInput } from "@/lib/validations/updateProfile.schema";
import { useSessionStore } from "@/store/session.store";

export function useUpdateUserProfile() {
  const queryClient = useQueryClient();
  const userId = useSessionStore((s) => s.userId);

  return useMutation({
    mutationFn: (data: UpdateProfileInput) => updateProfile(data),
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.USER_PROFILE(userId),
      });
    },
  });
}
