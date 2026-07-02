import type { Prisma } from "@prisma/client";

import { touchProjectActivity } from "@/db/projectMember.db";
import { EActivityLog } from "@/enum/activityLog.enum";
import { ETaskStatus } from "@/enum/taskStatus.enum";
import { prisma } from "@/lib/prisma";
import {
  CreateTaskDTO,
  UpdateTaskAssigneesDTO,
  UpdateTaskPositionDTO,
  UpdateTaskStatusDTO,
} from "@/types/task.dto";

export async function createTaskDB(data: CreateTaskDTO) {
  return prisma.$transaction(async (tx) => {
    const lastTask = await tx.task.findFirst({
      where: {
        taskBoardId: data.taskBoardId,
      },
      orderBy: {
        order: "desc",
      },
      select: {
        order: true,
      },
    });

    const updatedProject = await tx.project.update({
      where: { id: data.projectId },
      data: {
        ticketCounter: {
          increment: 1,
        },
      },
      select: {
        ticketCounter: true,
      },
    });

    const currentTicketNumber = updatedProject.ticketCounter - 1;

    const member = await tx.projectMember.findFirst({
      where: {
        projectId: data.projectId,
        userId: data.userId,
      },
      select: {
        id: true,
      },
    });

    // The task inherits the status the destination column is configured to
    // stamp (columns own their status now — see TaskBoard.status). Falls back
    // to TODO if the column somehow has none.
    const board = await tx.taskBoard.findUnique({
      where: { id: data.taskBoardId },
      select: { status: true },
    });
    const status = board?.status ?? ETaskStatus.TODO;

    const res = await tx.task.create({
      data: {
        title: data.title,
        ticketNumber: currentTicketNumber,
        description: data.description,
        priority: data.priority,
        status,
        projectId: data.projectId,
        taskBoardId: data.taskBoardId,
        order: (lastTask?.order ?? 0) + 1,
        assignees: {
          createMany: {
            data: (data.assignees ?? []).map((memberId) => ({
              projectMemberId: memberId,
            })),
          },
        },
        creatorId: member?.id || "",
      },
      include: {
        assignees: true,
      },
    });

    // Audit trail: record that this member created the task (powers the task
    // detail timeline).
    if (member?.id) {
      await tx.activityLog.create({
        data: {
          type: EActivityLog.TASK_CREATE,
          taskId: res.id,
          projectId: data.projectId,
          actorId: member.id,
        },
      });
    }

    // Float this project to the top of the user's "Recents".
    await touchProjectActivity(
      { userId: data.userId, projectId: data.projectId },
      tx,
    );

    return res;
  });
}

export async function updateTaskPositionsDB({
  projectId,
  userId,
  taskId,
  taskBoardId,
  orderedTaskIdsByBoard,
}: UpdateTaskPositionDTO) {
  const accessibleBoards = await prisma.taskBoard.findMany({
    where: {
      id: {
        in: orderedTaskIdsByBoard.map((board) => board.taskBoardId),
      },
      projectId,
      project: {
        members: {
          some: { userId },
        },
      },
    },
    select: { id: true },
  });

  if (accessibleBoards.length !== orderedTaskIdsByBoard.length) {
    throw new Error("One or more task boards are inaccessible");
  }

  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      taskBoard: {
        projectId,
        project: {
          members: { some: { userId } },
        },
      },
    },
    select: {
      id: true,
      taskBoardId: true,
      status: true,
    },
  });

  if (!task) {
    throw new Error("Task is inaccessible");
  }

  const currentMember = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: { userId, projectId },
    },
    select: { id: true },
  });

  if (!currentMember) {
    throw new Error("User is not a member of this project");
  }

  // The destination column owns the status it stamps onto tasks that land in
  // it — read it so we can align the moved task's status below.
  const destinationBoard = await prisma.taskBoard.findUnique({
    where: { id: taskBoardId },
    select: { status: true },
  });

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const isColumnChanged = task.taskBoardId !== taskBoardId;

    if (isColumnChanged) {
      // Audit: the task moved between columns.
      await tx.activityLog.create({
        data: {
          type: EActivityLog.COLUMN_CHANGE,
          taskId: task.id,
          projectId,
          actorId: currentMember.id,
          columnChange: {
            create: {
              fromBoardId: task.taskBoardId,
              toBoardId: taskBoardId,
            },
          },
        },
      });

      // Align the status field with the destination column's configured
      // status. Overridable later via the drawer's Status dropdown.
      const suggestedStatus = destinationBoard?.status;

      if (suggestedStatus && suggestedStatus !== task.status) {
        await tx.task.update({
          where: { id: taskId },
          data: { status: suggestedStatus },
        });

        await tx.activityLog.create({
          data: {
            type: EActivityLog.STATUS_CHANGE,
            taskId: task.id,
            projectId,
            actorId: currentMember.id,
            statusChange: {
              create: {
                fromStatus: task.status,
                toStatus: suggestedStatus,
              },
            },
          },
        });
      }
    }

    await tx.task.update({
      where: { id: taskId },
      data: { taskBoardId },
    });

    for (const board of orderedTaskIdsByBoard) {
      for (const [index, orderedTaskId] of board.taskIds.entries()) {
        await tx.task.update({
          where: { id: orderedTaskId },
          data: {
            taskBoardId: board.taskBoardId,
            order: index + 1,
          },
        });
      }
    }

    // Float this project to the top of the user's "Recents".
    await touchProjectActivity({ userId, projectId }, tx);
  });
}

export async function updateTaskAssigneesDB({
  projectId,
  userId,
  taskId,
  assignees,
}: UpdateTaskAssigneesDTO) {
  // Make sure the task belongs to a project this user is a member of before
  // we touch its assignments.
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      projectId,
      project: {
        members: { some: { userId } },
      },
    },
    select: { id: true },
  });

  if (!task) {
    throw new Error("Task is inaccessible");
  }

  const currentMember = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: { userId, projectId },
    },
    select: { id: true },
  });

  if (!currentMember) {
    throw new Error("User is not a member of this project");
  }

  return prisma.$transaction(async (tx) => {
    // Assignees are a full replacement: wipe the existing rows and recreate
    // them from the incoming selection (the TaskAssignment join table has a
    // composite [taskId, projectMemberId] key, so there's nothing to diff).
    await tx.taskAssignment.deleteMany({ where: { taskId } });

    if (assignees.length > 0) {
      await tx.taskAssignment.createMany({
        data: assignees.map((projectMemberId) => ({
          taskId,
          projectMemberId,
        })),
      });
    }

    // Audit trail entry powering the task timeline.
    await tx.activityLog.create({
      data: {
        type: EActivityLog.ASSIGNEE_CHANGE,
        taskId,
        projectId,
        actorId: currentMember.id,
      },
    });

    // Float this project to the top of the user's "Recents".
    await touchProjectActivity({ userId, projectId }, tx);
  });
}

export async function updateTaskStatusDB({
  projectId,
  userId,
  taskId,
  status,
}: UpdateTaskStatusDTO) {
  // Make sure the task belongs to a project this user is a member of before
  // we change its status.
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      projectId,
      project: {
        members: { some: { userId } },
      },
    },
    select: { id: true, status: true },
  });

  if (!task) {
    throw new Error("Task is inaccessible");
  }

  // No-op if the status didn't actually change (avoids a noisy audit entry).
  if (task.status === status) return;

  const currentMember = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: { userId, projectId },
    },
    select: { id: true },
  });

  if (!currentMember) {
    throw new Error("User is not a member of this project");
  }

  return prisma.$transaction(async (tx) => {
    await tx.task.update({
      where: { id: taskId },
      data: { status },
    });

    // Audit trail entry powering the task timeline.
    await tx.activityLog.create({
      data: {
        type: EActivityLog.STATUS_CHANGE,
        taskId,
        projectId,
        actorId: currentMember.id,
        statusChange: {
          create: {
            fromStatus: task.status,
            toStatus: status,
          },
        },
      },
    });

    // Float this project to the top of the user's "Recents".
    await touchProjectActivity({ userId, projectId }, tx);
  });
}

export async function getTaskDetail(id: string) {
  return await prisma.task.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      projectId: true,
      taskBoardId: true,
      status: true,
      title: true,
      description: true,
      createdAt: true,
      updatedAt: true,
      priority: true,
      assignees: {
        select: {
          projectMember: {
            select: {
              id: true,
              user: {
                select: {
                  image: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      },
      createdBy: {
        select: {
          user: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      },
      activityLog: {
        select: {
          type: true,
          actor: {
            select: {
              user: {
                select: {
                  name: true,
                  image: true,
                },
              },
            },
          },
          columnChange: {
            select: {
              fromBoard: {
                select: {
                  title: true,
                },
              },
              toBoard: {
                select: {
                  title: true,
                },
              },
            },
          },
          statusChange: {
            select: {
              fromStatus: true,
              toStatus: true,
            },
          },
          comment: {
            select: {
              value: true,
              createdAt: true,
            },
          },
          createdAt: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });
}
