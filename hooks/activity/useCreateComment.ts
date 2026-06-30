import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

import { QUERY_KEYS } from "@/constant/queryKeys";
import useInvalidateRecents from "@/hooks/project/useInvalidateRecents";
import createComment from "@/lib/activityLog/comment.lib";

export default function useCreateComment({ taskId }: { taskId?: string }) {
  const queryClient = useQueryClient();
  const invalidateRecents = useInvalidateRecents();

  const taskBoardQueryKey = useMemo(() => QUERY_KEYS.TASK(taskId), [taskId]);

  const invalidateTask = async () => {
    await queryClient.invalidateQueries({
      queryKey: taskBoardQueryKey,
    });
  };

  const mutation = useMutation({
    mutationFn: createComment,
    onSettled: async () => {
      await invalidateTask();
      await invalidateRecents();
    },
  });

  return { mutation };
}
