"use client";

import { QUERY_KEYS } from "@/constant/queryKeys";
import fetchTask from "@/lib/task/fetchTask.lib";
import { TaskResponseDTO } from "@/types/task.dto";
import { useQuery } from "@tanstack/react-query";

export function useGetTaskDetail({
  id,
  isOpen,
}: {
  id?: string;
  isOpen: boolean;
}) {
  const { data, error, isLoading } = useQuery<TaskResponseDTO>({
    queryKey: QUERY_KEYS.TASK(id),
    queryFn: () => fetchTask(id),
    enabled: !!id && isOpen,
  });

  return { data, error, isLoading };
}
