"use client";

import { QUERY_KEYS } from "@/constant/queryKeys";
import fetchTaskBoard from "@/lib/taskboard/fetchTaskBoard.lib";
import {
  UserProjectParamsDTO,
  TaskBoardResponseDTO,
} from "@/types/taskboard.dto";
import { useQuery } from "@tanstack/react-query";

export function useGetTaskBoard({ userId, projectId }: UserProjectParamsDTO) {
  const { data, error, isLoading } = useQuery<TaskBoardResponseDTO[]>({
    queryKey: QUERY_KEYS.TASK_BOARDS(projectId, userId),
    queryFn: () =>
      fetchTaskBoard({
        userId,
        projectId,
      }),
  });

  return { data, error, isLoading };
}
