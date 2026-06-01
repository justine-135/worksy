import { QUERY_KEYS } from "@/constant/queryKeys";
import inviteMember from "@/lib/members/inviteMember.lib";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

export default function useInviteMember({
  receiverId,
}: {
  receiverId?: string | null;
}) {
  const queryClient = useQueryClient();

  const rolesQueryKey = useMemo(
    () => QUERY_KEYS.INVITES(receiverId),
    [receiverId],
  );

  const invalidateMembers = async () => {
    await queryClient.invalidateQueries({
      queryKey: rolesQueryKey,
    });
  };

  const mutation = useMutation({
    mutationFn: inviteMember,
    onSettled: invalidateMembers,
  });

  return { mutation };
}
