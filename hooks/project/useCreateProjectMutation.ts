import createProjectMutation from "@/lib/project/createProject.lib";
import { useMutation } from "@tanstack/react-query";

export default function useCreateProjectMutation({
  invalidateProjects,
}: {
  invalidateProjects: () => Promise<void>;
}) {
  const mutation = useMutation({
    mutationFn: createProjectMutation,
    onSettled: invalidateProjects,
  });

  return { mutation };
}
