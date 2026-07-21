import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { CreateNotificationDTO } from "@/types/notification.dto";

// Comment out load more for now
export async function getNotifications(
  userId: string,
  //   { cursor, limit = 20 }: { cursor?: string; limit?: number },
) {
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    // take: limit + 1, // fetch one extra to know if there's a next page
    // ...(cursor && { cursor: { id: cursor }, skip: 1 }),
  });

  //   const hasMore = notifications.length > limit;
  //   const items = hasMore ? notifications.slice(0, -1) : notifications;

  //   return {
  //     items,
  //     nextCursor: hasMore ? items[items.length - 1].id : null,
  //   };

  return notifications;
}

export async function getUnreadNotificationCount(userId: string) {
  return await prisma.notification.count({ where: { userId, read: false } });
}

// Mark one read
export async function markAsReadNotification({
  userId,
  id,
}: {
  userId: string;
  id: string;
}) {
  return await prisma.notification.updateMany({
    where: {
      id,
      userId,
    },
    data: {
      read: true,
      readAt: new Date(),
    },
  });
}

// Mark all as read
export async function markAllAsReadNotification(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true, readAt: new Date() },
  });
}

export async function notify({
  senderId,
  receiverId,
  type,
  title,
  body,
  data: payload,
}: CreateNotificationDTO) {
  if (senderId === receiverId) return null;
  return prisma.notification.create({
    data: {
      userId: receiverId,
      type,
      title,
      body,
      data: payload as Prisma.InputJsonValue,
    },
  });
}
