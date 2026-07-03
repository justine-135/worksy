import { getServerSession } from "next-auth";

import { checkPermissionDB } from "@/db/permission.db";
import { authConfig } from "@/lib/auth/auth";

export async function checkPermission(projectId: string) {
  const session = await getServerSession(authConfig);
  if (!session?.user?.id) return false;

  const data = await checkPermissionDB(projectId, session.user.id);

  return !!data;
}

/**
 * Server-side authorization check for a single permission key.
 *
 * Returns `true` only if `userId` is a member of `projectId` whose role grants
 * `permission` (e.g. `Permissions.TaskCreate`). Route handlers call this after
 * their session check to reject (403) mutations the caller isn't allowed to
 * make — the real security boundary, since hiding a button on the client is
 * only cosmetic. Always pass the authenticated `session.user.id`, never a
 * client-supplied id.
 */
export async function hasPermissionInProject(
  projectId: string,
  userId: string,
  permission: string,
) {
  const keys = await checkPermissionDB(projectId, userId);
  return keys.includes(permission);
}
