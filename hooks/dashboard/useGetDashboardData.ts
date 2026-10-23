"use client";

import { useQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/constant/queryKeys";
import fetchDashboardData from "@/lib/dashboard/fetchDashboardData.lib";
import { DashboardFullResponseDTO } from "@/types/dashboard.dto";

export function useGetDashboardData({
  projectId,
}: {
  projectId?: string | null;
}) {
  const { data, error, isLoading } = useQuery<DashboardFullResponseDTO>({
    queryKey: QUERY_KEYS.DASHBOARD(),
    queryFn: () =>
      fetchDashboardData({
        projectId,
      }),
    enabled: !!projectId,
  });

  return { data, error, isLoading };
}
