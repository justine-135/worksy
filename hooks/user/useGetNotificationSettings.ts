"use client";

import { useQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/constant/queryKeys";
import fetchNotificationSettings from "@/lib/user/fetchNotificationSettings.lib";
import { useSessionStore } from "@/store/session.store";
import { NotificationSettingsDTO } from "@/types/user.dto";

export function useGetNotificationSettings() {
  const userId = useSessionStore((s) => s.userId);

  return useQuery<NotificationSettingsDTO>({
    queryKey: QUERY_KEYS.USER_NOTIFICATION_SETTINGS(userId),
    queryFn: fetchNotificationSettings,
    enabled: !!userId,
    staleTime: 30_000,
  });
}
