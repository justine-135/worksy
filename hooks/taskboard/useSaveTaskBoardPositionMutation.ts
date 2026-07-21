import { useMutation } from "@tanstack/react-query";

import saveTaskBoardPosition from "@/lib/taskboard/saveTaskboardPosition.lib";
import { TaskBoardPositionMutationDTO } from "@/types/taskboard.dto";

export default function useSaveTaskBoardPositionMutation({
  projectId,
  invalidateTaskBoards,
}: TaskBoardPositionMutationDTO) {
  const mutation = useMutation({
    mutationFn: (variables: { orderedTaskBoardIds: string[] }) =>
      saveTaskBoardPosition({ ...variables, projectId }),
    onSettled: invalidateTaskBoards,
  });

  return { mutation };
}
