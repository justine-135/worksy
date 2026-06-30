import { touchProjectActivity } from "@/db/projectMember.db";
import { prisma } from "@/lib/prisma";
import {
  CreateTaskBoardDTO,
  UpdateTaskBoardPositionDTO,
  UserProjectParamsDTO,
} from "@/types/taskboard.dto";

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
                      id: true,
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
