import { useMutation } from "@tanstack/react-query";

import useInvalidateRecents from "@/hooks/project/useInvalidateRecents";
import createTask from "@/lib/task/createTask";

export default function useCreateTaskMutation({
  invalidateTasks,
}: {
  invalidateTasks: () => Promise<void>;
}) {
  const invalidateRecents = useInvalidateRecents();

  const mutation = useMutation({
    mutationFn: createTask,
    // Creating a task touches project activity, so refresh the board data and
    // the sidebar "Recents" list together. onSettled runs on success or error.
    onSettled: async () => {
      await invalidateTasks();
      await invalidateRecents();
    },
  });

  return { mutation };
}
