"use client";

import fetchTaskBoard from "@/lib/taskboard/fetchTaskBoard.lib";
import {
  TaskBoardParamsDTO,
  TaskBoardResponseDTO,
} from "@/types/taskboard.dto";
import { useQuery } from "@tanstack/react-query";

export function useGetTaskBoard({ userId, projectId }: TaskBoardParamsDTO) {
  const { data, error, isLoading } = useQuery<TaskBoardResponseDTO[]>({
    queryKey: ["taskBoard", userId, projectId],
    queryFn: () =>
      fetchTaskBoard({
        userId,
        projectId,
      }),
  });

  return { data, error, isLoading };
}
