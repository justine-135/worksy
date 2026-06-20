import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

import { QUERY_KEYS } from "@/constant/queryKeys";
import createInvite from "@/lib/invite/createInvite";

export default function useCreateInvite({
  receiverId,
}: {
  receiverId?: string | null;
}) {
  const queryClient = useQueryClient();

  const inviteKey = useMemo(() => QUERY_KEYS.INVITES(receiverId), [receiverId]);

  const invalidateInvites = async () => {
    await queryClient.invalidateQueries({
      queryKey: inviteKey,
    });
  };

  const mutation = useMutation({
    mutationFn: createInvite,
    onSettled: invalidateInvites,
  });

  return { mutation };
}
