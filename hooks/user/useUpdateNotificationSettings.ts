"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/constant/queryKeys";
import updateNotificationSettings from "@/lib/user/updateNotificationSettings.lib";
import { NotificationSettingsInput } from "@/lib/validations/notificationSettings.schema";
import { useSessionStore } from "@/store/session.store";

export function useUpdateNotificationSettings() {
  const queryClient = useQueryClient();
  const userId = useSessionStore((s) => s.userId);

  return useMutation({
    mutationFn: (data: NotificationSettingsInput) =>
      updateNotificationSettings(data),
    onMutate: async ({ notificationsEnabled }) => {
      const key = QUERY_KEYS.USER_NOTIFICATION_SETTINGS(userId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData(key);
      queryClient.setQueryData(key, { notificationsEnabled });
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous !== undefined) {
        queryClient.setQueryData(
          QUERY_KEYS.USER_NOTIFICATION_SETTINGS(userId),
          ctx.previous,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.USER_NOTIFICATION_SETTINGS(userId),
      });
    },
  });
}
