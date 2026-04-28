import { prisma } from "@/lib/prisma";
import { CreateProjectMemberDTO } from "@/types/projectMember.dto";
import { UserProjectParamsDTO } from "@/types/taskboard.dto";

export async function getProjectMembers({ projectId }: { projectId: string }) {
  return prisma.projectMember.findMany({
    where: { projectId },
    select: {
      id: true,
      roleId: true,
      createdAt: true,
      updatedAt: true,
      user: true,
      role: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

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

export async function createMember(data: CreateProjectMemberDTO) {
  return prisma.projectMember.create({
    data: {
      user: {
        connect: { id: data.userId },
      },
      project: {
        connect: { id: data.projectId },
      },
    },
  });
}
