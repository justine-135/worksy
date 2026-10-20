import { getServerSession } from "next-auth";

import {
  getNotificationSettings,
  updateNotificationSettings,
} from "@/db/user.db";
import { apiError, apiSuccess } from "@/lib/api/apiResponse.lib";
import { authConfig } from "@/lib/auth/auth";
import { notificationSettingsSchema } from "@/lib/validations/notificationSettings.schema";

export async function GET() {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return apiError("You must be signed in.", 401);
  }

  try {
    const data = await getNotificationSettings({ userId: session.user.id });

    if (!data) {
      return apiError("User not found.", 404);
    }

    return apiSuccess("Notification settings loaded.", data);
  } catch (error) {
    console.error("GET /api/user/notification-settings failed:", error);
    return apiError("Couldn't load notification settings.", 500);
  }
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return apiError("You must be signed in.", 401);
  }

  const body = await req.json().catch(() => null);
  const parsed = notificationSettingsSchema.safeParse(body);

  if (!parsed.success) {
    return apiError(
      "Invalid notification settings.",
      400,
      parsed.error.flatten().fieldErrors,
    );
  }

  try {
    const data = await updateNotificationSettings({
      userId: session.user.id,
      notificationsEnabled: parsed.data.notificationsEnabled,
    });

    return apiSuccess(
      data.notificationsEnabled
        ? "Notifications turned on."
        : "Notifications turned off.",
      data,
    );
  } catch (error) {
    console.error("PATCH /api/user/notification-settings failed:", error);
    return apiError("Couldn't update notification settings.", 500);
  }
}
