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
