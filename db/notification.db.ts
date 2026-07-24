import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { CreateNotificationDTO } from "@/types/notification.dto";

// Comment out load more for now
export async function getNotifications(
  userId: string,
  //   { cursor, limit = 20 }: { cursor?: string; limit?: number },
) {
  const notifications = await prisma.notification.findMany({
    where: {
      OR: [
        // Condition 1: Notification belongs directly to the user
        { userId },

        // Condition 2: User is a member of the group/resource tied to this notification
        {
          user: {
            memberships: {
              some: {
                userId: userId, // Directly checks the foreign key in the membership table
              },
            },
          },
        },
      ],
    },

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

export async function notify(
  {
    senderId,
    receiverId,
    type,
    title,
    body,
    data: payload,
  }: CreateNotificationDTO,
  tx?: Prisma.TransactionClient,
) {
  const client = tx || prisma;

  if (senderId === receiverId) return null;

  const member = await client.projectMember.findUnique({
    where: {
      id: receiverId,
    },
    select: {
      user: {
        select: {
          id: true,
        },
      },
    },
  });

  return client.notification.create({
    data: {
      userId: member?.user.id || receiverId,
      type,
      title,
      body,
      data: payload as Prisma.InputJsonValue,
    },
  });
}

interface CreateBulkNotifyDTO extends Omit<
  CreateNotificationDTO,
  "receiverId"
> {
  receiverIds: string[];
}

export async function bulkNotify(
  { senderId, receiverIds, type, title, data }: CreateBulkNotifyDTO,
  tx?: Prisma.TransactionClient,
) {
  const client = tx || prisma;

  if (!receiverIds || receiverIds.length === 0) return null;
  const withoutSender = receiverIds.filter((id) => id !== senderId);

  return await client.notification.createMany({
    data: withoutSender.map((receiverId) => ({
      userId: receiverId,
      type,
      title,
      // Prisma safely casts JS objects to Json columns natively
      data: data as unknown as Prisma.InputJsonValue,
    })),
  });
}
