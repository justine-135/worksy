import { useMutation, useQueryClient } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/constant/queryKeys";
import acceptInvite from "@/lib/members/acceptInvite";

export default function useAcceptInvite() {
  const queryClient = useQueryClient();

  const invalidateInvites = async () => {
    await queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.INVITES(),
    });
  };

  const mutation = useMutation({
    mutationFn: acceptInvite,
    onSettled: invalidateInvites,
  });

  return { mutation };
}
