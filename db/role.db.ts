import { prisma } from "@/lib/prisma";
import { AddRoleDTO, RolesResponseDTO } from "@/types/roles.dto";

export async function getRoles({ projectId }: { projectId: string }) {
  const roles = await prisma.role.findMany({
    where: {
      projectId,
    },
  });

  return roles as RolesResponseDTO[];
}

export async function createRole({ name, permissions, projectId }: AddRoleDTO) {
  const role = await prisma.role.create({
    data: {
      name,
      projectId,
      permissions: {
        create: permissions.map((key) => ({ key })),
      },
    },
  });

  return role as RolesResponseDTO;
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
      projectId, // Standard shorthand for { projectId: projectId }
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
