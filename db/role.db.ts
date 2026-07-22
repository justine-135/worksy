import { touchProjectActivity } from "@/db/projectMember.db";
import { prisma } from "@/lib/prisma";
import { AddRoleDTO, EditRoleDTO } from "@/types/roles.dto";

export async function getRoles({
  projectId,
  skip,
  take,
}: {
  projectId: string;
  skip: number;
  take: number;
}) {
  return prisma.$transaction(async (tx) => {
    const roles = await prisma.role.findMany({
      where: {
        projectId,
      },
      take,
      skip,
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

    const count = await tx.role.count({ where: { projectId } });

    return { data: roles, count };
  });
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

/** Resolve which project a role belongs to (for server-side permission checks). */
export async function getRoleProjectId(roleId: string) {
  const role = await prisma.role.findUnique({
    where: { id: roleId },
    select: { projectId: true },
  });

  return role?.projectId ?? null;
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
  await touchProjectActivity({
    userId: actorUserId,
    projectId: newRole.projectId,
  });

  return newRole;
}
