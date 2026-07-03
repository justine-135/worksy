import { useMutation, useQueryClient } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/constant/queryKeys";
import useInvalidateRecents from "@/hooks/project/useInvalidateRecents";
import updateTaskRelation from "@/lib/task/updateTaskRelation.lib";

export default function useUpdateTaskRelation() {
  const queryClient = useQueryClient();
  const invalidateRecents = useInvalidateRecents();

  const mutation = useMutation({
    mutationFn: updateTaskRelation,
    onSettled: async (_data, _error, variables) => {
      // A relation change touches both linked task drawers (parent + child), so
      // invalidate the whole "task" prefix, plus the board cards and Recents.
      await queryClient.invalidateQueries({ queryKey: ["task"] });
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.TASK_BOARDS(variables.projectId, variables.userId),
      });
      await invalidateRecents();
    },
  });

  return { mutation };
}
