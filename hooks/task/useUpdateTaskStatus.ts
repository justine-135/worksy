import { useMutation, useQueryClient } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/constant/queryKeys";
import useInvalidateRecents from "@/hooks/project/useInvalidateRecents";
import updateTaskStatus from "@/lib/task/updateTaskStatus.lib";

export default function useUpdateTaskStatus() {
  const queryClient = useQueryClient();
  const invalidateRecents = useInvalidateRecents();

  const mutation = useMutation({
    mutationFn: updateTaskStatus,
    onSettled: async (_data, _error, variables) => {
      // Refresh the open task (drawer timeline) and the board cards / dashboard
      // counts so the new status is reflected everywhere, plus the Recents list.
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.TASK(variables.taskId),
      });
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.TASK_BOARDS(variables.projectId, variables.userId),
      });
      await invalidateRecents();
    },
  });

  return { mutation };
}
