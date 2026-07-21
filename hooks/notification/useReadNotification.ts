import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

import { QUERY_KEYS } from "@/constant/queryKeys";
import markReadNotification from "@/lib/notification/markReadNotification";

export default function useReadNotification() {
  const queryClient = useQueryClient();

  const notificationKey = useMemo(() => QUERY_KEYS.NOTIFICATION(), []);

  const invalidateNotification = async () => {
    await queryClient.invalidateQueries({
      queryKey: notificationKey,
    });
  };

  const mutation = useMutation({
    mutationFn: markReadNotification,
    onSettled: invalidateNotification,
  });

  return { mutation };
}
