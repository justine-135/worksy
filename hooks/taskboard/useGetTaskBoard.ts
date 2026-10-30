"use client";

import { useQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/constant/queryKeys";
import fetchTaskBoard, {
  BoardFilter,
} from "@/lib/taskboard/fetchTaskBoard.lib";
import { TaskBoardResponseDTO } from "@/types/taskboard.dto";

export function useGetTaskBoard({
  projectId,
  filter,
}: {
  projectId?: string | null;
  filter?: BoardFilter;
}) {
  const { data, error, isLoading } = useQuery<TaskBoardResponseDTO[]>({
    queryKey: QUERY_KEYS.TASK_BOARDS(projectId, filter),
    queryFn: () =>
      fetchTaskBoard({
        projectId,
        filter,
      }),
    enabled: !!projectId,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  return { data, error, isLoading };
}
