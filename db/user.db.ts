import { prisma } from "@/lib/prisma";

export async function getUser({
  query,
  currentUserId,
}: {
  query: string;
  currentUserId: string;
}) {
  return prisma.user.findMany({
    where: {
      AND: [
        {
          id: {
            not: currentUserId,
          },
        },
        {
          OR: [
            {
              email: {
                contains: query,
                mode: "insensitive",
              },
            },
            {
              name: {
                contains: query,
                mode: "insensitive",
              },
            },
          ],
        },
      ],
    },
    take: 10,
  });
}

export async function getUserById({ userId }: { userId: string }) {
  return prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      name: true,
      email: true,
      image: true,
    },
  });
}

// Lean profile shape for the Settings > Profile / Account cards.
export async function getUserProfile({ userId }: { userId: string }) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
    },
  });
}

export async function getNotificationSettings({ userId }: { userId: string }) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { notificationsEnabled: true },
  });
}

export async function updateNotificationSettings({
  userId,
  notificationsEnabled,
}: {
  userId: string;
  notificationsEnabled: boolean;
}) {
  return prisma.user.update({
    where: { id: userId },
    data: { notificationsEnabled },
    select: { notificationsEnabled: true },
  });
}

// User-global update — no ActivityLog / touchProjectActivity (those are project-audit constructs; editing your own profile isn't a project action).
export async function updateUserProfile({
  userId,
  name,
  image,
}: {
  userId: string;
  name?: string;
  image?: string | null;
}) {
  return prisma.user.update({
    where: { id: userId },
    data: { name, image },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
    },
  });
}
