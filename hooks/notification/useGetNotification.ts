"use client";

import { useQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/constant/queryKeys";
import fetchNotification from "@/lib/notification/fetchNotification";
import { NotificationResponseDTO } from "@/types/notification.dto";

export function useGetNotification() {
  const { data, error, isLoading } = useQuery<NotificationResponseDTO>({
    queryKey: QUERY_KEYS.NOTIFICATION(),
    queryFn: fetchNotification,
  });

  return { data, error, isLoading };
}
