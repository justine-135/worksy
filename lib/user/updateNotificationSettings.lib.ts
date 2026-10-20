import { throwApiError } from "@/lib/api/apiMessage.lib";
import { NotificationSettingsInput } from "@/lib/validations/notificationSettings.schema";
import { NotificationSettingsDTO } from "@/types/user.dto";

export default async function updateNotificationSettings(
  data: NotificationSettingsInput,
): Promise<NotificationSettingsDTO> {
  const res = await fetch("/api/user/notification-settings", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) await throwApiError(res, "Failed to update notification settings");

  const json = await res.json();
  return json.data;
}
