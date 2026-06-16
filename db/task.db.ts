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
