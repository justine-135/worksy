import { touchProjectActivity } from "@/db/projectMember.db";
import { prisma } from "@/lib/prisma";
import { CommentDTO } from "@/types/activityLog.dto";

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
