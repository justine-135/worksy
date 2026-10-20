import { throwApiError } from "@/lib/api/apiMessage.lib";
import { NotificationSettingsDTO } from "@/types/user.dto";

export default async function fetchNotificationSettings(): Promise<NotificationSettingsDTO> {
  const res = await fetch("/api/user/notification-settings");

  if (!res.ok) await throwApiError(res, "Failed to fetch notification settings");

  const json = await res.json();
  return json.data;
}
