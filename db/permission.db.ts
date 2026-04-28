import { prisma } from "@/lib/prisma";
import { PermissionReponseDTO } from "@/types/permission";

export async function getPermissions() {
  const permissions = await prisma.permission.findMany();

  return permissions as PermissionReponseDTO[];
}
