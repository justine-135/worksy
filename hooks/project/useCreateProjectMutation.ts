import { QUERY_KEYS } from "@/constant/queryKeys";
import createProjectMutation from "@/lib/project/createProject.lib";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

export default function useCreateProjectMutation({
  userId,
}: {
  userId: string | null;
}) {
  const queryClient = useQueryClient();

  const taskBoardQueryKey = useMemo(
    () => QUERY_KEYS.PROJECTS(userId),
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
