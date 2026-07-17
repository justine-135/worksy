import { throwApiError } from "@/lib/api/apiMessage.lib";

export default async function markAllReadNotification() {
  const response = await fetch(`/api/notification/read-all`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) await throwApiError(response, "Failed to mark read");

  return response.json();
}
