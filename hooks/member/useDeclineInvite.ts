import { useMutation, useQueryClient } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/constant/queryKeys";
import declineInvite from "@/lib/members/declineInvite";

export default function useDeclineInvite() {
  const queryClient = useQueryClient();

  const invalidateInvites = async () => {
    await queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.INVITES(),
    });
  };

  const mutation = useMutation({
    mutationFn: declineInvite,
    onSettled: invalidateInvites,
  });

  return { mutation };
}
