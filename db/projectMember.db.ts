import { prisma } from "@/lib/prisma";
import { EditMemberStatusRoleDTO } from "@/types/projectMember.dto";
import { UserProjectParamsDTO } from "@/types/taskboard.dto";

export async function getProjectMembers({ projectId }: { projectId: string }) {
  return prisma.projectMember.findMany({
    where: { projectId },
    select: {
      id: true,
      createdAt: true,
      updatedAt: true,
      user: true,
      status: true,
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

export async function updateMemberStatusRole(data: EditMemberStatusRoleDTO) {
  return prisma.projectMember.update({
    where: {
      id: data.userId,
    },
    data: {
      roleId: data.roleId,
      status: data.status,
    },
  });
}
