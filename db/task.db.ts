import { ActivityLog } from "@/enum/activityLog.enum";
import { prisma } from "@/lib/prisma";
import { CreateTaskDTO, UpdateTaskPositionDTO } from "@/types/task.dto";
import type { Prisma } from "@prisma/client";

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

    const res = await tx.task.create({
      data: {
        title: data.title,
        ticketNumber: currentTicketNumber,
        description: data.description,
        priority: data.priority,
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

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const isStatusChanged = task.taskBoardId !== taskBoardId;

    if (isStatusChanged) {
      await tx.activityLog.create({
        data: {
          type: ActivityLog.STATUS_CHANGE,
          taskId: task.id,
          projectId,
          actorId: currentMember.id,
          statusChange: {
            create: {
              fromBoardId: task.taskBoardId,
              toBoardId: taskBoardId,
            },
          },
        },
      });
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
  });
}

export async function getTaskDetail(id: string) {
  return await prisma.task.findUnique({
    where: {
      id,
    },
    select: {
      title: true,
      description: true,
      createdAt: true,
      updatedAt: true,
      priority: true,
      assignees: {
        select: {
          projectMember: {
            select: {
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
          statusChange: {
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
          createdAt: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });
}
