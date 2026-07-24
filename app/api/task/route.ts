import { getServerSession } from "next-auth";

import { createTaskDB, updateTaskPositionsDB } from "@/db/task.db";
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
  const { projectId, taskId, taskBoardId, orderedTaskIdsByBoard } = body;

  if (
    !projectId ||
    !taskId ||
    !taskBoardId ||
    !Array.isArray(orderedTaskIdsByBoard) ||
    orderedTaskIdsByBoard.length === 0
  ) {
    return apiError("Invalid request. Some task details are missing.", 400);
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
    await updateTaskPositionsDB({
      projectId,
      userId: session?.user?.id,
      taskId,
      taskBoardId,
      orderedTaskIdsByBoard,
    });

    return apiSuccess("Tasks reordered.");
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Internal server error",
      400,
    );
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return apiError("You must be signed in to continue.", 401);
  }

  const body = await req.json();
  const {
    title,
    assignees,
    description,
    task_board_id,
    priority,
    project_id,
    parent_id,
  } = body;

  if (!title || !task_board_id || !project_id) {
    return apiError("Please provide the required task details.", 400);
  }

  if (
    !(await hasPermissionInProject(
      project_id,
      session.user.id,
      Permissions.TaskCreate,
    ))
  ) {
    return apiError("Forbidden", 403);
  }

  const data = await createTaskDB({
    title,
    assignees,
    description,
    taskBoardId: task_board_id,
    priority,
    projectId: project_id,
    userId: session?.user?.id,
    parentId: parent_id ?? null,
  });

  return apiSuccess("Task created.", data);
}
