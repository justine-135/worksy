import { throwApiError } from "@/lib/api/apiMessage.lib";

export default async function fetchUserById({
  userId,
}: {
  userId?: string | null;
}) {
  const res = await fetch(`/api/user/${userId}`);
  if (!res.ok) await throwApiError(res, "Failed to fetch user");
  return res.json();
}
