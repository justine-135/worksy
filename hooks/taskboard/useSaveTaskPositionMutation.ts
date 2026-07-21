import { useMutation } from "@tanstack/react-query";

import useInvalidateRecents from "@/hooks/project/useInvalidateRecents";
import saveTaskPosition from "@/lib/taskboard/saveTaskPosition.lib";
import { TaskBoardPositionMutationDTO } from "@/types/taskboard.dto";

export default function useSaveTaskPositionMutation({
  projectId,
  invalidateTaskBoards,
}: TaskBoardPositionMutationDTO) {
  const invalidateRecents = useInvalidateRecents();

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
        projectId,
      }),

    onSettled: async () => {
      await invalidateTaskBoards();
      await invalidateRecents();
    },
  });

  return { mutation };
}
