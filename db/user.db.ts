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
      id: true,
      name: true,
      email: true,
      image: true,
      memberships: {
        select: {
          projectId: true,
          role: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });
}
