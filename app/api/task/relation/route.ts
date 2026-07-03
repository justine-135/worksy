import { getServerSession } from "next-auth";

import { updateTaskRelationDB } from "@/db/task.db";
import { Permissions } from "@/enum/permissions.enum";
import { apiError, apiSuccess } from "@/lib/api/apiResponse.lib";
import { authConfig } from "@/lib/auth/auth";
import { hasPermissionInProject } from "@/lib/permission/checkPermission";

export async function PATCH(req: Request) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return apiError("You must be signed in to continue.", 401);
  }

  const body = await req.json();
  const { projectId, userId, parentId, childId, action } = body;

  if (
    !projectId ||
    !userId ||
    !parentId ||
    !childId ||
    (action !== "add" && action !== "remove")
  ) {
    return apiError("Invalid task relationship request.", 400);
  }

  if (
    !(await hasPermissionInProject(
      projectId,
      session.user.id,
      Permissions.TaskEdit,
    ))
  ) {
    return apiError("Forbidden", 403);
  }

  try {
    await updateTaskRelationDB({ projectId, userId, parentId, childId, action });
  } catch (error) {
    // Surface cycle-guard / access errors as a 400 so the client toast can show
    // why the link was rejected.
    return apiError(
      error instanceof Error ? error.message : "Failed to update the task link.",
      400,
    );
  }

  return apiSuccess("Task link updated.");
}
