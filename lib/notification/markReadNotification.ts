import { throwApiError } from "@/lib/api/apiMessage.lib";

export default async function markReadNotification(id?: string) {
  const response = await fetch(`/api/notification/${id}/read`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) await throwApiError(response, "Failed to mark read");

  return response.json();
}
