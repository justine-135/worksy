import { getServerSession } from "next-auth";

import { checkPermissionDB } from "@/db/permission.db";
import { authConfig } from "@/lib/auth/auth";

export async function checkPermission(projectId: string) {
  const session = await getServerSession(authConfig);
  if (!session?.user?.id) return false;

  const data = await checkPermissionDB(projectId, session.user.id);

  return !!data;
}
