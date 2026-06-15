import { prisma } from "@/lib/prisma";
import { CreateTaskDTO, UpdateTaskPositionDTO } from "@/types/task.dto";
import type { Prisma } from "@prisma/client";

export async function createTaskDB(data: CreateTaskDTO) {
  const lastTask = await prisma.task.findFirst({
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

  const lastTicket = await prisma.task.findFirst({
    where: {
      taskBoard: {
        projectId: data.projectId,
      },
    },
    select: {
      ticketNumber: true,
    },
  });

  return prisma.task.create({
    data: {
      title: data.title,
      ticketNumber: (lastTicket?.ticketNumber ?? 0) + 1,
      description: data.description,
      priority: data.priority,
      taskBoardId: data.taskBoardId,
      order: (lastTask?.order ?? 0) + 1,
      assignees: {
        createMany: {
          data: (data.assignees ?? []).map((memberId) => ({
            projectMemberId: memberId,
          })),
        },
      },
    },
    include: {
      assignees: true,
    },
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
          some: {
            userId,
          },
        },
      },
    },
    select: {
      id: true,
    },
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
          members: {
            some: {
              userId,
            },
          },
        },
      },
    },
    select: {
      id: true,
    },
  });

  if (!task) {
    throw new Error("Task is inaccessible");
  }

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.task.update({
      where: {
        id: taskId,
      },
      data: {
        taskBoardId,
      },
    });

    for (const board of orderedTaskIdsByBoard) {
      for (const [index, orderedTaskId] of board.taskIds.entries()) {
        await tx.task.update({
          where: {
            id: orderedTaskId,
          },
          data: {
            taskBoardId: board.taskBoardId,
            order: index + 1,
          },
        });
      }
    }
  });
}
