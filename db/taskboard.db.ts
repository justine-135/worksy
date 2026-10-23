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
  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [boards, overdueTasks, upcomingTasksRaw, memberWorkloadRaw] =
    await Promise.all([
      prisma.taskBoard.findMany({
        where: {
          project: {
            id: projectId,
            members: { some: { userId } },
          },
        },
        orderBy: { order: "asc" },
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
              priority: true,
              dueDate: true,
              assignees: {
                where: { projectMember: { userId } },
                select: {
                  projectMember: {
                    select: {
                      user: { select: { name: true, image: true } },
                    },
                  },
                },
              },
            },
          },
        },
      }),
      prisma.task.findMany({
        where: {
          projectId,
          dueDate: { lt: now },
          status: { not: "DONE" },
          project: { members: { some: { userId } } },
        },
        orderBy: { dueDate: "asc" },
        take: 10,
        select: {
          id: true,
          ticketNumber: true,
          title: true,
          priority: true,
          dueDate: true,
          taskBoard: { select: { title: true } },
        },
      }),
      prisma.task.findMany({
        where: {
          projectId,
          dueDate: { gte: now, lte: sevenDaysFromNow },
          status: { not: "DONE" },
          project: { members: { some: { userId } } },
        },
        orderBy: { dueDate: "asc" },
        take: 10,
        select: {
          id: true,
          ticketNumber: true,
          title: true,
          priority: true,
          dueDate: true,
          taskBoard: { select: { title: true } },
        },
      }),
      prisma.projectMember.findMany({
        where: {
          projectId,
          status: "active",
          project: { members: { some: { userId } } },
        },
        select: {
          id: true,
          user: { select: { name: true, image: true } },
          taskAssignments: {
            select: { task: { select: { status: true } } },
          },
        },
      }),
    ]);

  const memberWorkload = memberWorkloadRaw
    .map((m) => ({
      memberId: m.id,
      name: m.user.name ?? "Unknown",
      image: m.user.image,
      todoCount: m.taskAssignments.filter((a) => a.task.status === "TODO")
        .length,
      inProgressCount: m.taskAssignments.filter(
        (a) => a.task.status === "IN_PROGRESS",
      ).length,
      doneCount: m.taskAssignments.filter((a) => a.task.status === "DONE")
        .length,
    }))
    .filter((m) => m.todoCount + m.inProgressCount + m.doneCount > 0)
    .sort(
      (a, b) =>
        b.todoCount +
        b.inProgressCount +
        b.doneCount -
        (a.todoCount + a.inProgressCount + a.doneCount),
    )
    .slice(0, 8);

  const mapTask = (t: {
    id: string;
    ticketNumber: number;
    title: string;
    priority: string | null;
    dueDate: Date | null;
    taskBoard: { title: string };
  }) => ({
    id: t.id,
    ticketNumber: t.ticketNumber,
    title: t.title,
    priority: t.priority,
    dueDate: t.dueDate!.toISOString(),
    boardTitle: t.taskBoard.title,
  });

  return {
    boards,
    overdueTasks: overdueTasks.map(mapTask),
    upcomingTasks: upcomingTasksRaw.map(mapTask),
    memberWorkload,
  };
}
