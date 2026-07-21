"use client";

import { useQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/constant/queryKeys";
import fetchTaskBoard from "@/lib/taskboard/fetchTaskBoard.lib";
import { TaskBoardResponseDTO } from "@/types/taskboard.dto";

export function useGetTaskBoard({ projectId }: { projectId?: string | null }) {
  const { data, error, isLoading } = useQuery<TaskBoardResponseDTO[]>({
    queryKey: QUERY_KEYS.TASK_BOARDS(projectId),
    queryFn: () =>
      fetchTaskBoard({
        projectId,
      }),
    enabled: !!projectId,
  });

  return { data, error, isLoading };
}
