import { prisma } from "@/lib/prisma";
import { CreateProjectInviteDTO } from "@/types/projectInvite.dto";

export async function createProjectInvite(data: CreateProjectInviteDTO) {
  return prisma.projectInvite.create({
    data: {
      userSender: {
        connect: { id: data.senderId },
      },
      userReceiver: {
        connect: { id: data.receiverId },
      },
      project: {
        connect: { id: data.projectId },
      },
    },
  });
}

export async function getProjectInvitesByReceiverId({
  receiverId,
}: {
  receiverId: string;
}) {
  return prisma.projectInvite.findMany({
    where: {
      receiverId,
    },
    select: {
      id: true,
      userSender: true,
      project: {
        select: {
          id: true,
          title: true,
          description: true,
          imageUrl: true,
          members: {
            select: {
              id: true,
            },
          },
        },
      },
      createdAt: true,
    },
  });
}
