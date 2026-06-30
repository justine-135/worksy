import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

import { QUERY_KEYS } from "@/constant/queryKeys";
import useInvalidateRecents from "@/hooks/project/useInvalidateRecents";
import editMemberStatusRole from "@/lib/members/editMemberStatusRole";

export default function useUpdateMemberStatusRole({
  projectId,
}: {
  projectId?: string | null;
}) {
  const queryClient = useQueryClient();
  const invalidateRecents = useInvalidateRecents();

  const memberQueryKey = useMemo(
    () => QUERY_KEYS.PROJECT_MEMBERS(projectId),
    [projectId],
  );

  const invalidateMembers = async () => {
    await queryClient.invalidateQueries({
      queryKey: memberQueryKey,
    });
  };

  const mutation = useMutation({
    mutationFn: editMemberStatusRole,
    onSettled: async () => {
      await invalidateMembers();
      await invalidateRecents();
    },
  });

  return { mutation };
}
