import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

import { QUERY_KEYS } from "@/constant/queryKeys";
import editRole from "@/lib/role/editRole.lib";

export default function useEditRoleMutation({
  projectId,
}: {
  projectId: string | null;
}) {
  const queryClient = useQueryClient();

  const rolesQueryKey = useMemo(() => QUERY_KEYS.ROLES(projectId), [projectId]);

  const invalidateRoles = async () => {
    await queryClient.invalidateQueries({
      queryKey: rolesQueryKey,
    });
  };

  const mutation = useMutation({
    mutationFn: editRole,
    onSettled: invalidateRoles,
  });

  return { mutation };
}
