"use client";

import { useQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/constant/queryKeys";
import fetchDashboardData from "@/lib/dashboard/fetchDashboardData.lib";
import { DashboardDataResponseDTO } from "@/types/dashboard.dto";

export function useGetDashboardData({
  projectId,
}: {
  projectId?: string | null;
}) {
  const { data, error, isLoading } = useQuery<DashboardDataResponseDTO[]>({
    queryKey: QUERY_KEYS.DASHBOARD(),
    queryFn: () =>
      fetchDashboardData({
        projectId,
      }),
    enabled: !!projectId,
  });

  return { data, error, isLoading };
}
