import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

import { QUERY_KEYS } from "@/constant/queryKeys";
import useInvalidateRecents from "@/hooks/project/useInvalidateRecents";
import addRole from "@/lib/role/addRole.lib";

export default function useAddRoleMutation({
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
    mutationFn: addRole,
    onSettled: async () => {
      await invalidateRoles();
      await invalidateRecents();
    },
  });

  return { mutation };
}
