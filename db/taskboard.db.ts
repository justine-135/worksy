import { prisma } from "@/lib/prisma";
import { TaskBoardDTO } from "@/types/taskboard.dto";

export async function getTaskBoard(userId: string, projectId: string) {
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
    select: {
      id: true,
      title: true,
      tasks: {
        select: {
          id: true,
          title: true,
          description: true,
          priority: true,
          assignee: {
            select: {
              user: {
                select: {
                  name: true,
                  image: true,
                  id: true,
                },
              },
            },
          },
        },
      },
    },
  });
  return data as TaskBoardDTO[];
}
