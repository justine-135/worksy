import { getServerSession } from "next-auth";

import { updateTaskStatusDB } from "@/db/task.db";
import { Permissions } from "@/enum/permissions.enum";
import { ETaskStatus } from "@/enum/taskStatus.enum";
import { apiError, apiSuccess } from "@/lib/api/apiResponse.lib";
import { authConfig } from "@/lib/auth/auth";
import { hasPermissionInProject } from "@/lib/permission/checkPermission";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return apiError("You must be signed in to continue.", 401);
  }

  const { id } = await params;
  const body = await req.json();
  const { projectId, status } = body;

  const isValidStatus = Object.values(ETaskStatus).includes(status);

  if (!id || !projectId || !isValidStatus) {
    return apiError("Invalid task status.", 400);
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
    await updateTaskStatusDB({
      projectId,
      userId: session?.user.id,
      taskId: id,
      status,
    });

    return apiSuccess("Task status updated.");
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Internal server error",
      400,
    );
  }
}
