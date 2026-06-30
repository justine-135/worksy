import { touchProjectActivity } from "@/db/projectMember.db";
import { StatusDTO } from "@/enum/member";
import { InviteStatusDTO } from "@/enum/projectInvite.enum";
import { prisma } from "@/lib/prisma";
import { CreateProjectInviteDTO } from "@/types/projectInvite.dto";

export async function createProjectInvite(data: CreateProjectInviteDTO) {
  const invite = await prisma.projectInvite.create({
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

  // Sending an invite is an action on the project for the sender.
  await touchProjectActivity({
    userId: data.senderId,
    projectId: data.projectId,
  });

  return invite;
}

export async function getProjectInvitesByReceiverId({
  receiverId,
}: {
  receiverId: string;
}) {
  return prisma.projectInvite.findMany({
    where: {
      receiverId,
      status: "PENDING",
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

export async function acceptInvite(inviteId: string) {
  return prisma.$transaction(async (tx) => {
    const invite = await tx.projectInvite.findUniqueOrThrow({
      where: {
        id: inviteId,
        status: InviteStatusDTO.PENDING,
      },
    });

    const member = await tx.projectMember.create({
      data: {
        user: {
          connect: {
            id: invite.receiverId,
          },
        },
        project: {
          connect: {
            id: invite.projectId,
          },
        },
        status: StatusDTO.pending,
      },
    });

    await tx.projectInvite.update({
      where: {
        id: inviteId,
      },
      data: {
        status: InviteStatusDTO.ACCEPTED,
      },
    });

    // Accepting an invite is the receiver's first action on this project.
    await touchProjectActivity(
      { userId: invite.receiverId, projectId: invite.projectId },
      tx,
    );

    return member;
  });
}
