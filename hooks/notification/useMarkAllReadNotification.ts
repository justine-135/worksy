import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

import { QUERY_KEYS } from "@/constant/queryKeys";
import markAllReadNotification from "@/lib/notification/markAllReadNotification";

export default function useMarkAllReadNotification() {
  const queryClient = useQueryClient();
  const notificationKey = useMemo(() => QUERY_KEYS.NOTIFICATION(), []);

  const mutation = useMutation({
    mutationFn: markAllReadNotification,
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: notificationKey });
    },
  });

  return { mutation };
}
