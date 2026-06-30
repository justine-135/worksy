import { touchProjectActivity } from "@/db/projectMember.db";
import { prisma } from "@/lib/prisma";
import { CommentDTO } from "@/types/activityLog.dto";

/**
 * Most recent activity across a whole project, newest first.
 * Powers the dashboard "Activity" feed. `actor` is a ProjectMember, so we hop
 * to `actor.user` for the display name/avatar.
 */
export async function getProjectActivity({
  projectId,
  limit = 8,
}: {
  projectId: string;
  limit?: number;
}) {
  return prisma.activityLog.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      type: true,
      createdAt: true,
      actor: {
        select: {
          user: { select: { name: true, image: true } },
        },
      },
      task: { select: { ticketNumber: true, title: true } },
      statusChange: {
        select: {
          toBoard: { select: { title: true } },
          fromBoard: { select: { title: true } },
        },
      },
    },
  });
}

export async function createComment({
  userId,
  projectId,
  type,
  taskId,
  value,
}: CommentDTO) {
  const currentMember = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: { userId, projectId },
    },
    select: { id: true },
  });

  if (!currentMember) {
    throw new Error("User is not a member of this project");
  }

  const res = await prisma.activityLog.create({
    data: {
      type,
      taskId,
      projectId,
      actorId: currentMember?.id,
      comment: {
        create: {
          value,
        },
      },
    },
  });

  // Float this project to the top of the user's "Recents".
  await touchProjectActivity({ userId, projectId });

  return res;
}
