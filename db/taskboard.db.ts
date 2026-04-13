import { prisma } from "@/lib/prisma";

export async function getTaskboard() {
  return prisma.taskBoard.findMany({
    include: {
      tasks: true,
    },
  });
  //   where: {
  //   members: {
  //     some: {
  //       userId,
  //     },
  //   },
  // },
}
