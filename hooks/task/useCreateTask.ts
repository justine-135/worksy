import createTask from "@/lib/task/createTask";
import { useMutation } from "@tanstack/react-query";

export default function useCreateTaskMutation({
  invalidateTasks,
}: {
  invalidateTasks: () => Promise<void>;
}) {
  const mutation = useMutation({
    mutationFn: createTask,
    onSettled: invalidateTasks,
  });

  return { mutation };
}
