import { getServerSession } from "next-auth";

import {
  createTaskBoard,
  deleteAllTasksInBoardDB,
  deleteTaskBoardDB,
  getTaskBoard,
  updateTaskBoardDB,
  updateTaskBoardOrdersDB,
} from "@/db/taskboard.db";
import { Permissions } from "@/enum/permissions.enum";
import { apiError, apiSuccess } from "@/lib/api/apiResponse.lib";
import { authConfig } from "@/lib/auth/auth";
import { hasPermissionInProject } from "@/lib/permission/checkPermission";

export async function GET(req: Request) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return apiError("You must be signed in to continue.", 401);
  }

  const { searchParams } = new URL(req.url);

  const project_id = searchParams.get("project_id");

  if (!project_id) {
    return apiError("Missing project id.", 400);
  }

  const data = await getTaskBoard({
    userId: session?.user.id,
    projectId: project_id,
  });

  return Response.json(data);
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return apiError("You must be signed in to continue.", 401);
  }

  const body = await req.json();
  const { projectId, orderedTaskBoardIds } = body;

  if (
    !projectId ||
    !Array.isArray(orderedTaskBoardIds) ||
    orderedTaskBoardIds.length === 0
  ) {
    return apiError("Invalid column order.", 400);
  }

  if (
    !(await hasPermissionInProject(
      projectId,
      session.user.id,
      Permissions.BoardEdit,
    ))
  ) {
    return apiError("Forbidden", 403);
  }

  await updateTaskBoardOrdersDB({
    projectId,
    userId: session?.user?.id,
    orderedTaskBoardIds,
  });

  return apiSuccess("Columns reordered.");
}

export async function PUT(req: Request) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return apiError("You must be signed in to continue.", 401);
  }

  const body = await req.json();
  const { projectId, taskBoardId, title, status } = body;

  if (!projectId || !taskBoardId || !title || !status) {
    return apiError("Invalid column details.", 400);
  }

  if (
    !(await hasPermissionInProject(
      projectId,
      session.user.id,
      Permissions.BoardEdit,
    ))
  ) {
    return apiError("Forbidden", 403);
  }

  await updateTaskBoardDB({
    projectId,
    userId: session?.user?.id,
    taskBoardId,
    title,
    status,
  });

  return apiSuccess("Column updated.");
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return apiError("You must be signed in to continue.", 401);
  }

  const body = await req.json();
  const { projectId, taskBoardId, target } = body;

  if (
    !projectId ||
    !taskBoardId ||
    (target !== "board" && target !== "tasks")
  ) {
    return apiError("Invalid delete request.", 400);
  }

  // Deleting the column needs board.delete; only emptying it (removing its
  // tasks) needs task.delete.
  const requiredPermission =
    target === "board" ? Permissions.BoardDelete : Permissions.TaskDelete;

  if (
    !(await hasPermissionInProject(
      projectId,
      session.user.id,
      requiredPermission,
    ))
  ) {
    return apiError("Forbidden", 403);
  }

  // `target` selects the scope: drop the whole column, or just empty it.
  if (target === "board") {
    await deleteTaskBoardDB({
      projectId,
      userId: session?.user?.id,
      taskBoardId,
    });

    return apiSuccess("Column deleted.");
  }

  await deleteAllTasksInBoardDB({
    projectId,
    userId: session?.user?.id,
    taskBoardId,
  });

  return apiSuccess("All tasks in the column were deleted.");
}

export async function POST(req: Request) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return apiError("You must be signed in to continue.", 401);
  }

  const body = await req.json();
  const { projectId, title } = body;

  if (!projectId || !title) {
    return apiError("Please provide a column title.", 400);
  }

  if (
    !(await hasPermissionInProject(
      projectId,
      session.user.id,
      Permissions.BoardCreate,
    ))
  ) {
    return apiError("Forbidden", 403);
  }

  await createTaskBoard({
    projectId,
    title,
  });

  return apiSuccess("Column created.");
}
