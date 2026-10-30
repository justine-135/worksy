import { useMutation, useQueryClient } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/constant/queryKeys";
import useApiMessage from "@/hooks/common/useApiMessage";
import useInvalidateRecents from "@/hooks/project/useInvalidateRecents";
import updateTaskDueDate from "@/lib/task/updateTaskDueDate.lib";

export default function useUpdateTaskDueDate() {
  const queryClient = useQueryClient();
  const invalidateRecents = useInvalidateRecents();
  const { showError } = useApiMessage();

  const mutation = useMutation({
    mutationFn: updateTaskDueDate,
    onSettled: async (_data, _error, variables) => {
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.TASK(variables.taskId),
      });
      await invalidateRecents();
    },
    onError: (error, variables) => {
      showError(error, "Failed to update due date");
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.TASK_BOARDS(variables.projectId),
      });
    },
  });

  return { mutation };
}
