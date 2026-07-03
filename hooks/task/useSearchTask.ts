"use client";

import { useQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/constant/queryKeys";
import fetchTaskSearch from "@/lib/task/fetchTaskSearch.lib";
import { TaskSearchResultDTO } from "@/types/task.dto";

/**
 * Backs the relationship picker. Unlike useSearchUser this stays enabled with an
 * empty query (as long as the picker is open) so the API can return the 5 most
 * recent tasks the instant it opens. `excludeId` keeps the current task out of
 * its own picker.
 */
export function useSearchTask({
  projectId,
  query,
  excludeId,
  enabled,
}: {
  projectId?: string | null;
  query: string;
  excludeId?: string | null;
  enabled: boolean;
}) {
  const { data, error, isLoading } = useQuery<TaskSearchResultDTO[]>({
    queryKey: QUERY_KEYS.TASK_SEARCH(projectId, query),
    queryFn: () => fetchTaskSearch({ projectId, query, excludeId }),
    enabled: !!projectId && enabled,
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 5,
  });

  return { data: data || [], error, isLoading };
}
