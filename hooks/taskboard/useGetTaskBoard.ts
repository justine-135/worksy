"use client";

import { useQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/constant/queryKeys";
import fetchTaskBoard from "@/lib/taskboard/fetchTaskBoard.lib";
import {
  TaskBoardResponseDTO,
  UserProjectParamsDTO,
} from "@/types/taskboard.dto";

export function useGetTaskBoard({ userId, projectId }: UserProjectParamsDTO) {
  const { data, error, isLoading } = useQuery<TaskBoardResponseDTO[]>({
    queryKey: QUERY_KEYS.TASK_BOARDS(projectId, userId),
    queryFn: () =>
      fetchTaskBoard({
        userId,
        projectId,
      }),
    enabled: !!userId && !!projectId,
  });

  return { data, error, isLoading };
}
