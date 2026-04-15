import { prisma } from "@/lib/prisma";
import { UserProjectParamsDTO } from "@/types/taskboard.dto";

export async function getProjectMember({
  userId,
  projectId,
}: UserProjectParamsDTO) {
  return prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId,
        projectId,
      },
    },
  });
}
