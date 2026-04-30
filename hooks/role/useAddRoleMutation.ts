import addRole from "@/lib/role/addRole.lib";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

export default function useAddRoleMutation({
  projectId,
}: {
  projectId: string | null;
}) {
  const queryClient = useQueryClient();

  const rolesQueryKey = useMemo(
    () => ["roles", projectId] as const,
    [projectId],
  );

  const invalidateRoles = async () => {
    await queryClient.invalidateQueries({
      queryKey: rolesQueryKey,
    });
  };

  const mutation = useMutation({
    mutationFn: addRole,
    onSettled: invalidateRoles,
  });

  return { mutation };
}
