import { prisma } from "@/lib/prisma";
import { TaskBoardDTO } from "@/types/taskboard.dto";

export async function getTaskBoard(id: string) {
  const data = await prisma.taskBoard.findMany({
    where: {
      project: {
        members: {
          some: {
            userId: id,
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
        // include: {
        //   assignee: {
        //     include: {
        //       user: {
        //         select: {
        //           name: true,
        //           id: true,
        //           image: true,
        //         },
        //       },
        //     },
        //   },
        // },
      },
    },
  });
  return data as TaskBoardDTO[];
  //   where: {
  //   members: {
  //     some: {
  //       userId,
  //     },
  //   },
  // },
}
