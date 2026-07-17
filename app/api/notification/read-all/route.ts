import { getServerSession } from "next-auth";

import { markAllAsReadNotification } from "@/db/notification.db";
import { apiError, apiSuccess } from "@/lib/api/apiResponse.lib";
import { authConfig } from "@/lib/auth/auth";

export async function PUT() {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return apiError("You must be signed in to continue.", 401);
  }

  const data = await markAllAsReadNotification(session.user?.id);

  return apiSuccess("Marked all as read", data);
}
