import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

import { QUERY_KEYS } from "@/constant/queryKeys";
import editMemberStatusRole from "@/lib/members/editMemberStatusRole";

export default function useUpdateMemberStatusRole({
  projectId,
}: {
  projectId?: string | null;
}) {
  const queryClient = useQueryClient();

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
    onSettled: invalidateMembers,
  });

  return { mutation };
}
