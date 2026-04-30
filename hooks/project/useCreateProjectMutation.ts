import createProjectMutation from "@/lib/project/createProject.lib";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

export default function useCreateProjectMutation({
  userId,
}: {
  userId?: string | null;
}) {
  const queryClient = useQueryClient();

  const taskBoardQueryKey = useMemo(
    () => ["projects", userId] as const,
    [userId],
  );

  const invalidateProjects = async () => {
    await queryClient.invalidateQueries({
      queryKey: taskBoardQueryKey,
    });
  };

  const mutation = useMutation({
    mutationFn: createProjectMutation,
    onSettled: invalidateProjects,
  });

  return { mutation };
}
