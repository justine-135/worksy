import { useMutation } from "@tanstack/react-query";

import useApiMessage from "@/hooks/common/useApiMessage";
import useInvalidateRecents from "@/hooks/project/useInvalidateRecents";
import saveTaskPosition from "@/lib/taskboard/saveTaskPosition.lib";
import { TaskBoardPositionMutationDTO } from "@/types/taskboard.dto";

export default function useSaveTaskPositionMutation({
  projectId,
  invalidateTaskBoards,
}: TaskBoardPositionMutationDTO) {
  const invalidateRecents = useInvalidateRecents();
  const { showError } = useApiMessage();

  const mutation = useMutation({
    mutationFn: (variables: {
      taskId: string;
      taskTitle: string;
      taskBoardId: string;
      orderedTaskIdsByBoard: Array<{
        taskBoardId: string;
        taskIds: string[];
      }>;
    }) =>
      saveTaskPosition({
        taskId: variables.taskId,
        taskBoardId: variables.taskBoardId,
        orderedTaskIdsByBoard: variables.orderedTaskIdsByBoard,
        projectId,
      }),

    onSettled: async () => {
      await invalidateRecents();
    },
    onError: (error, variables) => {
      showError(
        error,
        `Failed to move "${variables.taskTitle}" (${variables.taskId})`,
      );
      invalidateTaskBoards();
    },
  });

  return { mutation };
}
