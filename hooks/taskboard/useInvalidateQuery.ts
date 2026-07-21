import { QueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

import { QUERY_KEYS } from "@/constant/queryKeys";

export default function useInvalidateQuery(
  projectId?: string | null,
  queryClient?: QueryClient,
) {
  const taskBoardQueryKey = useMemo(
    () => QUERY_KEYS.TASK_BOARDS(projectId),
    [projectId],
  );

  const invalidateTaskBoards = async () => {
    await queryClient?.invalidateQueries({
      queryKey: taskBoardQueryKey,
    });
  };

  return { taskBoardQueryKey, invalidateTaskBoards };
}
