import { useMutation, useQueryClient } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/constant/queryKeys";
import useInvalidateRecents from "@/hooks/project/useInvalidateRecents";
import updateTaskAssignees from "@/lib/task/updateTaskAssignees.lib";

export default function useUpdateTaskAssignees() {
  const queryClient = useQueryClient();
  const invalidateRecents = useInvalidateRecents();

  const mutation = useMutation({
    mutationFn: updateTaskAssignees,
    onSettled: async (_data, _error, variables) => {
      // Refresh the open task (drawer) and the board cards so their assignee
      // avatars re-render, plus the Recents list.
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
