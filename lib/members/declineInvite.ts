import { throwApiError } from "@/lib/api/apiMessage.lib";

export default async function acceptInvite({ inviteId }: { inviteId: string }) {
  const response = await fetch("/api/invite/decline", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      invite_id: inviteId,
    }),
  });

  if (!response.ok) await throwApiError(response, "Failed to invite member");

  return response.json();
}
