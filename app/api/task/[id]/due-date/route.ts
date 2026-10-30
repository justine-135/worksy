import { getServerSession } from "next-auth";

import { updateTaskDueDateDB } from "@/db/task.db";
import { Permissions } from "@/enum/permissions.enum";
import { apiError, apiSuccess } from "@/lib/api/apiResponse.lib";
import { authConfig } from "@/lib/auth/auth";
import { hasPermissionInProject } from "@/lib/permission/checkPermission";
import { broadcastToProject } from "@/lib/ws/boardBroadcaster.lib";

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
  const { projectId, dueDate } = body;

  if (!id || !projectId) {
    return apiError("Invalid request.", 400);
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
    await updateTaskDueDateDB({
      projectId,
      userId: session.user.id,
      taskId: id,
      dueDate: dueDate ?? null,
    });

    broadcastToProject(
      projectId,
      { type: "task:updated", projectId, taskId: id },
      req.headers.get("X-Client-Id") ?? undefined,
    );

    return apiSuccess("Due date updated.");
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Internal server error",
      400,
    );
  }
}
