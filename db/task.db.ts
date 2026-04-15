import { prisma } from "@/lib/prisma";
import { CreateTaskDTO, UpdateTaskPositionDTO } from "@/types/task.dto";

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

  return prisma.task.create({
    data: {
      ...data,
      order: (lastTask?.order ?? 0) + 1,
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

  await prisma.$transaction(async (tx) => {
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
