import { prisma } from "@/lib/prisma";
import { PermissionResponseDTO } from "@/types/permission";

export async function getPermissions() {
  const permissions = await prisma.permission.findMany();

  return permissions as PermissionResponseDTO[];
}

export async function checkPermissionDB(projectId: string, userId: string) {
  const member = await prisma.projectMember.findFirst({
    where: {
      projectId,
      userId,
    },
    select: {
      role: {
        select: {
          permissions: {
            select: {
              key: true,
            },
          },
        },
      },
    },
  });

  const permissionKeys = member?.role?.permissions.map((p) => p.key) || [];
  return permissionKeys;
}
