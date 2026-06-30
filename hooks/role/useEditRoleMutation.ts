import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

import { QUERY_KEYS } from "@/constant/queryKeys";
import useInvalidateRecents from "@/hooks/project/useInvalidateRecents";
import editRole from "@/lib/role/editRole.lib";

export default function useEditRoleMutation({
  projectId,
}: {
  projectId: string | null;
}) {
  const queryClient = useQueryClient();
  const invalidateRecents = useInvalidateRecents();

  const rolesQueryKey = useMemo(() => QUERY_KEYS.ROLES(projectId), [projectId]);

  const invalidateRoles = async () => {
    await queryClient.invalidateQueries({
      queryKey: rolesQueryKey,
    });
  };

  const mutation = useMutation({
    mutationFn: editRole,
    onSettled: async () => {
      await invalidateRoles();
      await invalidateRecents();
    },
  });

  return { mutation };
}
