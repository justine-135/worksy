import { throwApiError } from "@/lib/api/apiMessage.lib";

export default async function fetchInvites({
  receiverId,
}: {
  receiverId?: string | null;
}) {
  const res = await fetch(`/api/project/invite/${receiverId}`);
  if (!res.ok) await throwApiError(res, "Failed to fetch invites");
  return res.json();
}
