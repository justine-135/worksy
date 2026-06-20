import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

import { QUERY_KEYS } from "@/constant/queryKeys";
import createComment from "@/lib/activityLog/comment.lib";

export default function useCreateComment({ taskId }: { taskId?: string }) {
  const queryClient = useQueryClient();

  const taskBoardQueryKey = useMemo(() => QUERY_KEYS.TASK(taskId), [taskId]);

  const invalidateTask = async () => {
    await queryClient.invalidateQueries({
      queryKey: taskBoardQueryKey,
    });
  };

  const mutation = useMutation({
    mutationFn: createComment,
    onSettled: invalidateTask,
  });

  return { mutation };
}
