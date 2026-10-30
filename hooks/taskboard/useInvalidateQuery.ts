import { QueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";

import { QUERY_KEYS } from "@/constant/queryKeys";

export default function useInvalidateQuery(
  projectId?: string | null,
  queryClient?: QueryClient,
) {
  const taskBoardQueryKey = useMemo(
    () => QUERY_KEYS.TASK_BOARDS(projectId),
    [projectId],
  );

  const invalidateTaskBoards = useCallback(async () => {
    await queryClient?.invalidateQueries({
      queryKey: taskBoardQueryKey,
    });
  }, [queryClient, taskBoardQueryKey]);

  return { taskBoardQueryKey, invalidateTaskBoards };
}
