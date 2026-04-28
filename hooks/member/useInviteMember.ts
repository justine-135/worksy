import inviteMember from "@/lib/members/inviteMember.lib";
import { useMutation } from "@tanstack/react-query";

export default function useInviteMember({
  invalidateMembers,
}: {
  invalidateMembers: () => Promise<void>;
}) {
  const mutation = useMutation({
    mutationFn: inviteMember,
    onSettled: invalidateMembers,
  });

  return { mutation };
}
