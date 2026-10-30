import { useMutation } from "@tanstack/react-query";

import useApiMessage from "@/hooks/common/useApiMessage";
import saveTaskBoardPosition from "@/lib/taskboard/saveTaskboardPosition.lib";
import { TaskBoardPositionMutationDTO } from "@/types/taskboard.dto";

export default function useSaveTaskBoardPositionMutation({
  projectId,
  invalidateTaskBoards,
}: TaskBoardPositionMutationDTO) {
  const { showError } = useApiMessage();

  const mutation = useMutation({
    mutationFn: (variables: { orderedTaskBoardIds: string[] }) =>
      saveTaskBoardPosition({ ...variables, projectId }),
    onError: (error) => {
      showError(error, "Failed to reorder columns");
      invalidateTaskBoards();
    },
  });

  return { mutation };
}
