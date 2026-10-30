import { useMutation, useQueryClient } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/constant/queryKeys";
import useApiMessage from "@/hooks/common/useApiMessage";
import useInvalidateRecents from "@/hooks/project/useInvalidateRecents";
import updateTaskStatus from "@/lib/task/updateTaskStatus.lib";

export default function useUpdateTaskStatus() {
  const queryClient = useQueryClient();
  const invalidateRecents = useInvalidateRecents();
  const { showError } = useApiMessage();

  const mutation = useMutation({
    mutationFn: updateTaskStatus,
    onSettled: async (_data, _error, variables) => {
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.TASK(variables.taskId),
      });
      await invalidateRecents();
    },
    onError: (error, variables) => {
      showError(error, "Failed to update status");
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.TASK_BOARDS(variables.projectId),
      });
    },
  });

  return { mutation };
}
