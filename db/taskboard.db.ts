import { touchProjectActivity } from "@/db/projectMember.db";
import { prisma } from "@/lib/prisma";
import {
  CreateTaskBoardDTO,
  DeleteTaskBoardDTO,
  UpdateTaskBoardDTO,
  UpdateTaskBoardPositionDTO,
  UserProjectParamsDTO,
} from "@/types/taskboard.dto";

/**
 * Confirm a single column belongs to a project the user is a member of.
 * Throws if not — shared guard for the board-scoped mutations below.
 */
async function assertBoardAccess(
  taskBoardId: string,
  projectId: string,
  userId: string,
) {
  const board = await prisma.taskBoard.findFirst({
    where: {
      id: taskBoardId,
      projectId,
      project: {
        members: {
          some: { userId },
        },
      },
    },
    select: { id: true },
  });

  if (!board) {
    throw new Error("Task board is inaccessible");
  }
}

export async function getTaskBoard({
  userId,
  projectId,
}: UserProjectParamsDTO) {
  const data = await prisma.taskBoard.findMany({
    where: {
      project: {
        id: projectId,
        members: {
          some: {
            userId,
          },
        },
      },
    },
    orderBy: {
      order: "asc",
    },
    select: {
      id: true,
      title: true,
      status: true,
      order: true,
      tasks: {
        orderBy: {
          order: "asc",
        },
        select: {
          id: true,
          ticketNumber: true,
          title: true,
          description: true,
          priority: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          assignees: {
            select: {
              projectMember: {
                select: {
                  user: {
                    select: {
                      image: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
      project: {
        select: {
          title: true,
        },
      },
    },
  });
  return data;
}

export async function updateTaskBoardOrdersDB({
  projectId,
  userId,
  orderedTaskBoardIds,
}: UpdateTaskBoardPositionDTO) {
  const accessibleBoards = await prisma.taskBoard.findMany({
    where: {
      id: {
        in: orderedTaskBoardIds,
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

  if (accessibleBoards.length !== orderedTaskBoardIds.length) {
    throw new Error("One or more task boards are inaccessible");
  }

  await prisma.$transaction(
    orderedTaskBoardIds.map((taskBoardId, index) =>
      prisma.taskBoard.update({
        where: {
          id: taskBoardId,
        },
        data: {
          order: index + 1,
        },
      }),
    ),
  );

  // Float this project to the top of the user's "Recents".
  await touchProjectActivity({ userId, projectId });
}

export async function createTaskBoard(data: CreateTaskBoardDTO) {
  const res = await prisma.taskBoard.create({
    data,
  });
  return res;
}

/**
 * Edit a single column's name + status. Position changes go through the
 * existing reorder path (`updateTaskBoardOrdersDB`), so this only touches the
 * two owned fields.
 *
 * Note: unlike task mutations, this writes no `ActivityLog` — that model is
 * task-scoped (`taskId` is required), so board-level edits can't be logged.
 * We still `touchProjectActivity` to keep the sidebar "Recents" convention.
 */
export async function updateTaskBoardDB({
  projectId,
  userId,
  taskBoardId,
  title,
  status,
}: UpdateTaskBoardDTO) {
  await assertBoardAccess(taskBoardId, projectId, userId);

  await prisma.$transaction(async (tx) => {
    await tx.taskBoard.update({
      where: { id: taskBoardId },
      data: { title, status },
    });

    // Float this project to the top of the user's "Recents".
    await touchProjectActivity({ userId, projectId }, tx);
  });
}

/**
 * Delete an entire column. Prisma cascades from `TaskBoard` remove its tasks
 * (and their assignments / activity logs / column-change details), so we only
 * delete the board itself.
 */
export async function deleteTaskBoardDB({
  projectId,
  userId,
  taskBoardId,
}: Omit<DeleteTaskBoardDTO, "target">) {
  await assertBoardAccess(taskBoardId, projectId, userId);

  await prisma.$transaction(async (tx) => {
    await tx.taskBoard.delete({ where: { id: taskBoardId } });

    // Float this project to the top of the user's "Recents".
    await touchProjectActivity({ userId, projectId }, tx);
  });
}

/**
 * Delete every task in a column but keep the column. `deleteMany` cascades to
 * each task's assignments and activity logs.
 */
export async function deleteAllTasksInBoardDB({
  projectId,
  userId,
  taskBoardId,
}: Omit<DeleteTaskBoardDTO, "target">) {
  await assertBoardAccess(taskBoardId, projectId, userId);

  await prisma.$transaction(async (tx) => {
    await tx.task.deleteMany({ where: { taskBoardId } });

    // Float this project to the top of the user's "Recents".
    await touchProjectActivity({ userId, projectId }, tx);
  });
}

export async function getDashboardData({
  userId,
  projectId,
}: UserProjectParamsDTO) {
  const data = await prisma.taskBoard.findMany({
    where: {
      project: {
        id: projectId,
        members: {
          some: {
            userId,
          },
        },
      },
    },
    orderBy: {
      order: "asc",
    },
    select: {
      id: true,
      title: true,
      status: true,
      tasks: {
        select: {
          id: true,
          status: true,
          title: true,
          ticketNumber: true,
          assignees: {
            where: {
              projectMember: {
                userId,
              },
            },
            select: {
              projectMember: {
                select: {
                  user: {
                    select: {
                      name: true,
                      image: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
  return data;
}
