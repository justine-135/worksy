import { throwApiError } from "@/lib/api/apiMessage.lib";

export default async function fetchNotification() {
  const res = await fetch(`/api/notification`);
  if (!res.ok) await throwApiError(res, "Failed to fetch notifications");
  return res.json();
}
