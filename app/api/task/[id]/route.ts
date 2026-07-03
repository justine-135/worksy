import { getServerSession } from "next-auth";

import {
  getTaskDetail,
  getTaskProjectId,
  updateTaskAssigneesDB,
} from "@/db/task.db";
import { Permissions } from "@/enum/permissions.enum";
import { apiError, apiSuccess } from "@/lib/api/apiResponse.lib";
import { authConfig } from "@/lib/auth/auth";
import { hasPermissionInProject } from "@/lib/permission/checkPermission";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return apiError("You must be signed in to continue.", 401);
  }
  const { id } = await params;

  if (!id) {
    return apiError("Missing task id.", 400);
  }

  // Viewing task details requires task.view in the task's project.
  const projectId = await getTaskProjectId(id);

  if (
    !projectId ||
    !(await hasPermissionInProject(
      projectId,
      session.user.id,
      Permissions.TaskView,
    ))
  ) {
    return apiError("Forbidden", 403);
  }

  const data = await getTaskDetail(id);

  return Response.json(data);
}

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
  const { projectId, userId, assignees } = body;

  if (!id || !projectId || !userId || !Array.isArray(assignees)) {
    return apiError("Invalid request. Please check the assignees.", 400);
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

  await updateTaskAssigneesDB({ projectId, userId, taskId: id, assignees });

  return apiSuccess("Assignees updated.");
}
