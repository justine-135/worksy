import { useMutation, useQueryClient } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/constant/queryKeys";
import createProjectMutation from "@/lib/project/createProject.lib";

export default function useCreateProjectMutation() {
  const queryClient = useQueryClient();

  const invalidateProjects = async () => {
    await queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.PROJECTS(),
    });
  };

  const mutation = useMutation({
    mutationFn: createProjectMutation,
    onSettled: invalidateProjects,
  });

  return { mutation };
}
