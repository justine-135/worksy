import { touchProjectActivity } from "@/db/projectMember.db";
import { NotificationType } from "@/enum/notifications.enum";
import { prisma } from "@/lib/prisma";
import { CreateCommentDTO } from "@/types/activityLog.dto";

import { bulkNotify } from "./notification.db";

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
      columnChange: {
        select: {
          toBoard: { select: { title: true } },
          fromBoard: { select: { title: true } },
        },
      },
      statusChange: {
        select: {
          fromStatus: true,
          toStatus: true,
        },
      },
    },
  });
}

/**
 * A single member's activity within a project, limited to the last `days`
 * (default 7). `actorId` is the ProjectMember id (ActivityLog.actor is a
 * ProjectMember, not a User), and the select shape matches
 * ActivityLogResponseDTO so the rows can be rendered by the shared
 * <ActivityLog /> timeline component.
 */
export async function getMemberActivity({
  projectId,
  memberId,
  days = 7,
}: {
  projectId: string;
  memberId: string;
  days?: number;
}) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  return prisma.activityLog.findMany({
    where: {
      projectId,
      actorId: memberId,
      createdAt: { gte: since },
    },
    orderBy: { createdAt: "desc" },
    select: {
      type: true,
      createdAt: true,
      task: { select: { id: true, ticketNumber: true, title: true } },
      actor: {
        select: {
          user: {
            select: { id: true, name: true, email: true, image: true },
          },
        },
      },
      columnChange: {
        select: {
          toBoard: { select: { title: true } },
          fromBoard: { select: { title: true } },
        },
      },
      statusChange: {
        select: {
          fromStatus: true,
          toStatus: true,
        },
      },
      comment: {
        select: { value: true, createdAt: true },
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
}: CreateCommentDTO) {
  const currentMember = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: { userId, projectId },
    },
    select: {
      id: true,
      user: {
        select: {
          name: true,
          image: true,
          email: true,
        },
      },
    },
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
    include: {
      task: {
        select: {
          assignees: {
            select: {
              projectMember: {
                select: {
                  user: {
                    select: {
                      id: true,
                    },
                  },
                },
              },
            },
          },
          createdBy: {
            select: {
              userId: true,
            },
          },
        },
      },
    },
  });

  // Float this project to the top of the user's "Recents".
  await touchProjectActivity({ userId, projectId });

  // const recipientIds = new Set([
  //   res.task.createdBy.userId,
  //   ...res.task.assignees.map((assignee) => assignee.projectMember.user.id),
  // ]);

  // Get user id for each assignees
  const mappedAssignees = res.task.assignees.map(
    (assignee) => assignee.projectMember.user.id,
  );

  // To avoid duplicate user id due to included createdby userId
  const filterCreatedById = mappedAssignees.filter(
    (id) => res.task.createdBy.userId != id,
  );

  const newRecipientIds = [res.task.createdBy.userId, ...filterCreatedById];

  // Notify participants of task
  await bulkNotify({
    senderId: userId,
    receiverIds: newRecipientIds,
    type: NotificationType.COMMENT,
    title: "left a comment",
    data: {
      projectId,
      taskId,
      user: currentMember.user,
    },
  });

  return res;
}
