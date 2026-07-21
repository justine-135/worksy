import { throwApiError } from "@/lib/api/apiMessage.lib";

export default async function fetchUserById() {
  const res = await fetch(`/api/user/logged-in`);
  if (!res.ok) await throwApiError(res, "Failed to fetch user");
  return res.json();
}
