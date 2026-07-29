import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";

import { markAsReadNotification } from "@/db/notification.db";
import { apiError, apiSuccess } from "@/lib/api/apiResponse.lib";
import { authConfig } from "@/lib/auth/auth";

export async function PUT(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return apiError("You must be signed in to continue.", 401);
  }

  const id = (await params).id;

  const data = await markAsReadNotification({
    userId: session.user?.id,
    id,
  });
  return apiSuccess("Marked as read", data);
}
