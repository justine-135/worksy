import { throwApiError } from "@/lib/api/apiMessage.lib";

export default async function fetchPermissions() {
  const res = await fetch(`/api/permission`);
  if (!res.ok) await throwApiError(res, "Failed to fetch permissions");
  return res.json();
}
