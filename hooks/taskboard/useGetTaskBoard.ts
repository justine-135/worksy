"use client";

import fetchTaskBoard from "@/lib/taskboard/fetchTaskBoard.lib";
import {
  UserProjectParamsDTO,
  TaskBoardResponseDTO,
} from "@/types/taskboard.dto";
import { useQuery } from "@tanstack/react-query";

export function useGetTaskBoard({ userId, projectId }: UserProjectParamsDTO) {
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
