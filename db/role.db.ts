import { touchProjectActivity } from "@/db/projectMember.db";
import { prisma } from "@/lib/prisma";
import { AddRoleDTO, EditRoleDTO } from "@/types/roles.dto";

export async function getRoles({ projectId }: { projectId: string }) {
  const roles = await prisma.role.findMany({
    where: {
      projectId,
    },
    select: {
      id: true,
      name: true,
      createdAt: true,
      permissions: {
        select: {
          key: true,
        },
      },
    },
  });

  return roles;
}

export async function createRole(
  { name, permissions, projectId }: AddRoleDTO,
  actorUserId: string,
) {
  const role = await prisma.role.create({
    data: {
      name,
      projectId,
      permissions: {
        create: permissions.map((key) => ({ key })),
      },
    },
  });

  // Float this project to the top of the actor's "Recents".
  await touchProjectActivity({ userId: actorUserId, projectId });

  return role;
}

export async function getRoleSearch({
  query,
  projectId,
}: {
  query: string;
  projectId: string;
}) {
  if (!query.trim()) {
    return [];
  }

  return prisma.role.findMany({
    where: {
      projectId,
      OR: [
        {
          name: {
            contains: query,
            mode: "insensitive",
          },
        },
      ],
    },
    take: 10,
  });
}

export async function updateRole(
  { data }: { data: EditRoleDTO },
  actorUserId: string,
) {
  const newRole = await prisma.role.update({
    where: {
      id: data.roleId,
    },
    data: {
      name: data.name,
      permissions: {
        deleteMany: {},

        createMany: {
          data: data.permissions.map((key) => ({
            key: key,
          })),
        },
      },
    },
    include: {
      permissions: true,
    },
  });

  // Float this project to the top of the actor's "Recents".
  await touchProjectActivity({ userId: actorUserId, projectId: newRole.projectId });

  return newRole;
}
