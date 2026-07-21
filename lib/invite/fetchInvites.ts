import { throwApiError } from "@/lib/api/apiMessage.lib";

export default async function fetchInvites() {
  const res = await fetch(`/api/project/invite`);
  if (!res.ok) await throwApiError(res, "Failed to fetch invites");
  return res.json();
}
