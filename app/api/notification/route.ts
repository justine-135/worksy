import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import {
  getNotifications,
  getUnreadNotificationCount,
} from "@/db/notification.db";
import { apiError } from "@/lib/api/apiResponse.lib";
import { authConfig } from "@/lib/auth/auth";

export async function GET() {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return apiError("You must be signed in to continue.", 401);
  }

  //   const cursor = req.nextUrl.searchParams.get("cursor") ?? undefined;

  const [data, unreadCount] = await Promise.all([
    getNotifications(session.user?.id),
    getUnreadNotificationCount(session.user?.id),
  ]);

  console.log(data);

  return NextResponse.json({ data, unreadCount });
}
