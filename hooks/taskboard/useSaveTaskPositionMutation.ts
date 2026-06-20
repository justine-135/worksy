import { useMutation } from "@tanstack/react-query";

import saveTaskPosition from "@/lib/taskboard/saveTaskPosition.lib";
import { TaskBoardPositionMutationDTO } from "@/types/taskboard.dto";

export default function useSaveTaskPositionMutation({
  userId,
  projectId,
  invalidateTaskBoards,
}: TaskBoardPositionMutationDTO) {
  const mutation = useMutation({
    mutationFn: (variables: {
      taskId: string;
      taskBoardId: string;
      orderedTaskIdsByBoard: Array<{
        taskBoardId: string;
        taskIds: string[];
      }>;
    }) =>
      saveTaskPosition({
        ...variables,
        userId,
        projectId,
      }),

    onSettled: invalidateTaskBoards,
  });

  return { mutation };
}
