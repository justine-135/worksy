import saveTaskBoardPosition from "@/lib/taskboard/saveTaskboardPosition.lib";
import { TaskBoardPositionMutationDTO } from "@/types/taskboard.dto";
import { useMutation } from "@tanstack/react-query";

export default function useSaveTaskBoardPositionMutation({
  userId,
  projectId,
  invalidateTaskBoards,
}: TaskBoardPositionMutationDTO) {
  const mutation = useMutation({
    mutationFn: (variables: { orderedTaskBoardIds: string[] }) =>
      saveTaskBoardPosition({ ...variables, userId, projectId }),
    onSettled: invalidateTaskBoards,
  });

  return { mutation };
}
